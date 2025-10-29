
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
      description: 'A list of simple, actionable sub-task strings.',
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
      contents: `You are an expert project manager specializing in helping neurodivergent individuals. Break down the following complex task into a series of small, clear, and actionable sub-tasks. The language should be supportive and simple. Task: "${task}"`,
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
            description: "A descriptive name for the routine (e.g., 'Morning Routine')."
        },
        tasks: {
            type: Type.ARRAY,
            description: "A list of tasks for the routine.",
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
            contents: `You are a helpful assistant. Parse the following text to create a named routine with a list of tasks. The first part before a colon is usually the name. Text: "${text}"`,
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
            description: 'An array of task IDs in the recommended order of execution, containing up to 5 tasks.',
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

    const prompt = `You are a productivity assistant for neurodivergent users. Your task is to recommend a small, manageable set of tasks (around 3, but no more than 5) for the user to focus on right now. The goal is to avoid overwhelm and encourage starting.
User's current energy level is: ${energyLevel}.

Here is the list of uncompleted tasks in JSON format:
${JSON.stringify(simplifiedTasks)}

Please recommend tasks based on these rules:
1. Strongly prioritize tasks that are due soon (within the next 2 days) or are already overdue. Today is ${new Date().toISOString().split('T')[0]}.
2. For the first one or two recommendations, pick tasks whose energy requirement is less than or equal to the user's current energy level to build momentum.
3. If possible, include a mix of priorities, but always favor urgency (due date) over priority level.
4. Do not recommend more than 5 tasks in total.

Return a JSON object containing a single key "recommendedTaskIds", which is an array of the task IDs you are recommending. The order of IDs in the array should be the order you recommend tackling them.`;

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
