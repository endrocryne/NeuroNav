
import { GoogleGenAI, Type } from "@google/genai";
import { Routine, Task, EnergyLevel } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const breakdownSchema = {
  type: Type.OBJECT,
  properties: {
    subTasks: {
      type: Type.ARRAY,
      description: 'List of subtask strings',
      items: { type: Type.STRING },
    },
  },
  required: ['subTasks'],
};

export const breakdownTask = async (task: string): Promise<string[]> => {
  if(!API_KEY) return Promise.resolve([]);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down this task into small, clear subtasks: "${task}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: breakdownSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    return result.subTasks || [];
  } catch (error) {
    console.error("Error breaking down task:", error);
    return [];
  }
};

const routineSchema = {
    type: Type.OBJECT,
    properties: {
        name: {
            type: Type.STRING,
            description: "Routine name"
        },
        tasks: {
            type: Type.ARRAY,
            description: "Task list",
            items: {
                type: Type.STRING,
            }
        }
    },
    required: ['name', 'tasks']
};


export const createRoutineFromText = async (text: string): Promise<Omit<Routine, 'id'>> => {
    if (!API_KEY) return Promise.resolve({ name: 'Untitled Routine', tasks: [] });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse this text to create a routine with tasks. Format: "Name: task1, task2, task3". Text: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: routineSchema
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error creating routine from text:", error);
        return { name: "Failed to parse", tasks: [] };
    }
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        recommendedTaskIds: {
            type: Type.ARRAY,
            description: 'Task IDs in recommended order (max 5)',
            items: { type: Type.STRING }
        },
    },
    required: ['recommendedTaskIds']
};

export const getRecommendedTasks = async (tasks: Task[], energyLevel: EnergyLevel): Promise<string[] | null> => {
    if (!API_KEY || tasks.length === 0) return Promise.resolve(null);

    const simplifiedTasks = tasks.map(({ id, title, priority, dueDate, energyRequired }) => ({
        id, title, priority, dueDate, energyRequired
    }));

    const prompt = `Recommend 3-5 tasks to focus on now. Energy level: ${energyLevel}. Tasks: ${JSON.stringify(simplifiedTasks)}. Prioritize overdue/due-soon tasks, match energy level, limit to 5 total. Return JSON: {"recommendedTaskIds": ["id1", "id2", ...]}. Today: ${new Date().toISOString().split('T')[0]}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result.recommendedTaskIds || null;
    } catch (error) {
        console.error("Error getting recommended tasks:", error);
        return null;
    }
};
