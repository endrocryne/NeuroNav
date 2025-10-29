import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Bot, User, Send, PlusSquare, Mic, MicOff } from 'lucide-react';
import { Task, Routine, UIMode, EnergyLevel, Page } from '../types';
import { functionDeclarations } from '../services/tools';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { breakdownTask } from '../services/geminiService';

// --- Audio Helper Functions ---
// Base64 encoding for audio data
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 decoding for audio data
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Creates a Blob object for the Gemini API from raw audio data
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


// Define message type for chat history
interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Props passed from App.tsx
interface AssistantViewProps {
  tasks: Task[];
  routines: Routine[];
  uiMode: UIMode;
  energyLevel: EnergyLevel;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  setUiMode: (mode: UIMode) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'priority' | 'dueDate' | 'energyRequired'>) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  applyRoutine: (id: string) => void;
  setCurrentPage: (page: Page) => void;
}

const API_KEY = process.env.API_KEY;

const getSystemInstruction = () => `
You are a helpful and empathetic assistant named NeuroNav, designed for a task management app for neurodivergent users.
Your primary goal is to make task management as easy and stress-free as possible.
When a user asks to add a new task, you MUST use the 'addTask' function. Do not ask for confirmation unless the request is very ambiguous.
The 'addTask' function will automatically break the task down into smaller subtasks, so you only need to call it once for the main task.
Always provide concise, positive, and clear responses. Your responses will be displayed in a chat bubble.
When functions are executed, you will receive the result. Summarize the result in a friendly, human-readable way. For example, if a task is added, say "I've added '[Task Title]' to your list for you!".
You have access to the user's current tasks, routines, and settings via function calls. Use these tools to provide helpful answers.
Today's date is ${new Date().toISOString().split('T')[0]}.
`;

const AssistantView: React.FC<AssistantViewProps> = (props) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Voice mode state
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const aiRef = useRef<GoogleGenAI | null>(null);


  const {
      tasks,
      routines,
      setTasks,
      setRoutines,
      setUiMode,
      setEnergyLevel,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      applyRoutine,
      setCurrentPage,
  } = props;
  
  // Initialize the AI instance
  useEffect(() => {
    if (!API_KEY) {
      if (history.length === 0 || (history.length > 0 && !history[0]?.content.includes('API key is missing'))) {
        setHistory([{ role: 'model', content: "I'm sorry, the AI assistant is not available. The API key is missing." }]);
      }
      return;
    }
    aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
  }, [history]);
  

  // Initialize the text chat session
  useEffect(() => {
    if (!API_KEY || !aiRef.current || isVoiceModeActive) return;

    const apiHistory = history
      .filter(msg => msg.content !== "Hello! I'm your NeuroNav assistant. How can I help you manage your day?")
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

    const chatSession = aiRef.current.chats.create({
      model: 'gemini-2.5-flash',
      tools: [{ functionDeclarations }],
      history: apiHistory,
      config: { systemInstruction: getSystemInstruction() },
    });
    setChat(chatSession);

    if (history.length === 0) {
      setHistory([{ role: 'model', content: "Hello! I'm your NeuroNav assistant. How can I help you manage your day?" }]);
    }
  }, [API_KEY, history, isVoiceModeActive]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, currentInputTranscription, currentOutputTranscription]);

  // Cleanup voice mode on component unmount
  useEffect(() => {
    return () => {
      stopVoiceMode();
    };
  }, []);

  const availableTools = useCallback({
    getTasks: () => ({ tasks: tasks.filter(t => !t.completed) }),
    addTask: async ({ title, parentId }: { title: string, parentId?: string }) => {
      if (parentId) {
        const subTask = addTask({ title, parentId, isSurvival: false });
        return { success: true, taskId: subTask.id, title: subTask.title, message: "Subtask added." };
      }
      
      const parentTask = addTask({ title, parentId: null, isSurvival: false });
      
      try {
        const subTasks = await breakdownTask(title);
        if (subTasks && subTasks.length > 0) {
          subTasks.forEach(subTitle => {
            addTask({ title: subTitle, parentId: parentTask.id, isSurvival: false });
          });
          return { 
            success: true, 
            taskId: parentTask.id, 
            title: parentTask.title,
            subtaskCount: subTasks.length,
            message: `Task "${title}" was added with ${subTasks.length} subtasks.`
          };
        } else {
           return { success: true, taskId: parentTask.id, title: parentTask.title, subtaskCount: 0, message: `Task "${title}" was added without subtasks.` };
        }
      } catch (error) {
        console.error("Error during AI breakdown in assistant:", error);
        return { success: true, taskId: parentTask.id, title: parentTask.title, error: "Task was added, but AI breakdown failed." };
      }
    },
    updateTask: ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
        updateTask(taskId, updates);
        return { success: true, message: `Task ${taskId} updated.` };
    },
    setTaskCompleted: ({ taskId, completed }: { taskId: string, completed: boolean }) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.completed !== completed) {
             toggleTask(taskId);
        }
        return { success: true, message: `Task ${taskId} marked as ${completed ? 'complete' : 'incomplete'}.` };
    },
    deleteTask: ({ taskId }: { taskId: string }) => {
        deleteTask(taskId);
        return { success: true, message: `Task ${taskId} deleted.` };
    },
    setUiMode: ({ mode }: { mode: UIMode }) => {
        setUiMode(mode);
        setCurrentPage(Page.Settings);
        return { success: true, message: `UI mode set to ${mode}.` };
    },
    setEnergyLevel: ({ level }: { level: EnergyLevel }) => {
        setEnergyLevel(level);
        setCurrentPage(Page.Settings);
        return { success: true, message: `Energy level set to ${level}.` };
    },
    applyRoutine: ({ routineId }: { routineId: string }) => {
        const routine = routines.find(r => r.id === routineId);
        if (!routine) return { success: false, message: 'Routine not found.' };
        applyRoutine(routineId);
        return { success: true, message: `Routine "${routine.name}" applied and tasks added.` };
    },
    updateRoutine: ({ routineId, updates }: { routineId: string, updates: Partial<Routine>}) => {
        updateRoutine(routineId, updates);
        return { success: true, message: `Routine ${routineId} updated.` };
    }
  }, [
      tasks, routines, addTask, updateTask, toggleTask, deleteTask, setUiMode, 
      setCurrentPage, setEnergyLevel, applyRoutine, updateRoutine
  ]);

  const stopVoiceMode = async () => {
      setIsListening(false);
      setIsVoiceModeActive(false);

      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      
      scriptProcessorRef.current?.disconnect();
      scriptProcessorRef.current = null;
      
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
      inputAudioContextRef.current = null;
      outputAudioContextRef.current = null;

      if (sessionPromiseRef.current) {
          try {
              const session = await sessionPromiseRef.current;
              session.close();
          } catch (e) {
              console.error("Error closing session:", e);
          }
          sessionPromiseRef.current = null;
      }
  };

  const startVoiceMode = async () => {
    if (!aiRef.current) return;
    setIsVoiceModeActive(true);
    setIsListening(true);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Microphone access denied:", e);
      setHistory(prev => [...prev, { role: 'model', content: "I can't use voice mode without microphone access. Please enable it in your browser settings."}]);
      setIsVoiceModeActive(false);
      setIsListening(false);
      return;
    }
    
    // Fix: Address TypeScript error for vendor-prefixed 'webkitAudioContext'.
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
    outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
    nextStartTimeRef.current = 0;
    audioSourcesRef.current = new Set();
    
    sessionPromiseRef.current = aiRef.current.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          if (!mediaStreamRef.current || !inputAudioContextRef.current) return;
          const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
          scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
                setCurrentOutputTranscription(prev => prev + message.serverContent.outputTranscription.text);
            }
            if (message.serverContent?.inputTranscription) {
                setCurrentInputTranscription(prev => prev + message.serverContent.inputTranscription.text);
            }
            if (message.serverContent?.turnComplete) {
                const finalInput = currentInputTranscription;
                const finalOutput = currentOutputTranscription;
                setHistory(prev => [
                    ...prev,
                    ...(finalInput.trim() ? [{ role: 'user', content: finalInput.trim() }] : []),
                    ...(finalOutput.trim() ? [{ role: 'model', content: finalOutput.trim() }] : [])
                ]);
                setCurrentInputTranscription('');
                setCurrentOutputTranscription('');
            }
            
            if (message.toolCall?.functionCalls) {
                const functionResponses = [];
                for (const fc of message.toolCall.functionCalls) {
                    const tool = availableTools[fc.name as keyof typeof availableTools];
                    if (tool) {
                        const result = await tool(fc.args);
                        functionResponses.push({ id: fc.id, name: fc.name, response: result });
                    }
                }
                sessionPromiseRef.current?.then((session) => {
                    session.sendToolResponse({ functionResponses });
                });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                setIsListening(false); // Model is speaking
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                const source = outputAudioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current.destination);
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0) {
                        setIsListening(true); // Ready to listen again
                    }
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
        },
        onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setHistory(prev => [...prev, {role: 'model', content: "Sorry, there was a voice connection error."}]);
            stopVoiceMode();
        },
        onclose: (e: CloseEvent) => {
            stopVoiceMode();
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: getSystemInstruction(),
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        tools: [{ functionDeclarations }],
      },
    });
  };

  const handleToggleVoiceMode = () => {
    if (isVoiceModeActive) {
      stopVoiceMode();
    } else {
      startVoiceMode();
    }
  };

  const handleNewChat = () => {
    if (!API_KEY || isLoading) return;
    if (isVoiceModeActive) stopVoiceMode();
    setHistory([]);
    // The useEffect for text chat will handle re-initialization
    setHistory([{ role: 'model', content: "Hello! I'm your NeuroNav assistant. How can I help you manage your day?" }]);
  };


  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !chat) return;
    const text = userInput.trim();
    setUserInput('');
    setIsLoading(true);
    setHistory(prev => [...prev, { role: 'user', content: text }]);

    try {
      let response: GenerateContentResponse = await chat.sendMessage({ message: text });
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        for (const fc of response.functionCalls) {
          const tool = availableTools[fc.name as keyof typeof availableTools];
          if (tool) {
            const result = await tool(fc.args);
            functionResponses.push({ id: fc.id, name: fc.name, response: result });
          }
        }
        const toolResponse = await chat.sendMessage({ functionResponses });
        if (toolResponse.text) {
          setHistory(prev => [...prev, { role: 'model', content: toolResponse.text }]);
        }
      } else if (response.text) {
        setHistory(prev => [...prev, { role: 'model', content: response.text }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setHistory(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
          <div className="p-2 border-b border-surface-variant flex items-center justify-between flex-shrink-0">
            <button
              onClick={handleToggleVoiceMode}
              className={`flex items-center gap-2 text-sm font-medium p-2 rounded-lg transition-colors ${isVoiceModeActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              aria-label={isVoiceModeActive ? 'Exit voice mode' : 'Enter voice mode'}
              disabled={!API_KEY}
            >
              {isVoiceModeActive ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isVoiceModeActive ? 'Voice Mode On' : 'Voice Mode'}</span>
            </button>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary p-2 rounded-lg transition-colors"
              aria-label="Start new chat"
            >
              <PlusSquare size={18} />
              <span>New Chat</span>
            </button>
          </div>
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
              {history.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'model' && <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary"/></div>}
                      <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-br-none' : 'bg-secondary text-on-secondary rounded-bl-none'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                       {msg.role === 'user' && <div className="w-8 h-8 bg-surface-variant rounded-full flex items-center justify-center flex-shrink-0"><User size={20} className="text-on-surface-variant"/></div>}
                  </div>
              ))}
              {!isVoiceModeActive && isLoading && (
                  <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary"/></div>
                      <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-secondary text-on-secondary rounded-bl-none">
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-0"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                          </div>
                      </div>
                  </div>
              )}
               {isVoiceModeActive && (currentInputTranscription || currentOutputTranscription) && (
                 <>
                  {currentInputTranscription && (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-primary text-on-primary rounded-br-none opacity-70">
                        <p className="text-sm whitespace-pre-wrap">{currentInputTranscription}</p>
                      </div>
                      <div className="w-8 h-8 bg-surface-variant rounded-full flex items-center justify-center flex-shrink-0"><User size={20} className="text-on-surface-variant"/></div>
                    </div>
                  )}
                  {currentOutputTranscription && (
                     <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-primary"/></div>
                      <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-secondary text-on-secondary rounded-bl-none opacity-70">
                          <p className="text-sm whitespace-pre-wrap">{currentOutputTranscription}</p>
                      </div>
                    </div>
                  )}
                 </>
               )}
          </div>
      </div>
      <div className="fixed bottom-16 inset-x-0 bg-surface/80 backdrop-blur-lg border-t border-surface-variant">
        <div className="max-w-4xl mx-auto">
          {isVoiceModeActive ? (
            <div className="flex flex-col items-center justify-center p-4 h-[92px]">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-primary' : 'bg-surface-variant'}`}>
                 <Mic size={32} className={`${isListening ? 'text-on-primary' : 'text-on-surface-variant'}`}/>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2 p-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask me to add a task..."
                    className="flex-grow bg-surface-variant/50 border border-surface-variant focus:ring-2 focus:ring-primary focus:border-primary rounded-full py-3 px-5 outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant"
                    disabled={isLoading || !API_KEY}
                />
                <button
                    type="submit"
                    className="bg-primary text-on-primary p-3 rounded-full hover:bg-primary-dark transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !userInput.trim() || !API_KEY}
                    aria-label="Send message"
                >
                    <Send size={24} />
                </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AssistantView;
