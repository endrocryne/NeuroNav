import { FunctionDeclaration, Type } from '@google/genai';
import { UIMode, EnergyLevel, Priority } from '../types';

export const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'getTasks',
        description: 'Get a list of all tasks. Good for answering questions like "what are my tasks for today?" or "do I have any high priority tasks?".',
        parameters: {
            type: Type.OBJECT,
            properties: {},
        }
    },
    {
        name: 'addTask',
        description: 'Add a new task or subtask.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'The title of the task.' },
                parentId: { type: Type.STRING, description: 'The ID of the parent task, if this is a subtask.' },
            },
            required: ['title']
        }
    },
    {
        name: 'updateTask',
        description: 'Update properties of an existing task, like its due date, priority, or energy level.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING, description: 'The ID of the task to update.' },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        dueDate: { type: Type.STRING, description: 'The due date in YYYY-MM-DD format.' },
                        priority: { type: Type.STRING, enum: Object.values(Priority) },
                        energyRequired: { type: Type.STRING, enum: Object.values(EnergyLevel) },
                    }
                }
            },
            required: ['taskId', 'updates']
        }
    },
    {
        name: 'setTaskCompleted',
        description: 'Mark a task or subtask as complete or incomplete.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING, description: 'The ID of the task to mark.' },
                completed: { type: Type.BOOLEAN, description: 'Set to true for complete, false for incomplete.' },
            },
            required: ['taskId', 'completed']
        }
    },
    {
        name: 'deleteTask',
        description: 'Delete a task.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING, description: 'The ID of the task to delete.' }
            },
            required: ['taskId']
        }
    },
    {
        name: 'setUiMode',
        description: "Change the app's user interface mode.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                mode: { type: Type.STRING, enum: Object.values(UIMode) }
            },
            required: ['mode']
        }
    },
    {
        name: 'setEnergyLevel',
        description: "Update the user's current energy level.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                level: { type: Type.STRING, enum: Object.values(EnergyLevel) }
            },
            required: ['level']
        }
    },
    {
        name: 'applyRoutine',
        description: 'Applies a routine, adding its tasks to the current task list and navigating to the task view.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                routineId: { type: Type.STRING, description: 'The ID of the routine to apply.' }
            },
            required: ['routineId']
        }
    },
    {
        name: 'updateRoutine',
        description: 'Updates a routine with a new name or new tasks.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                routineId: { type: Type.STRING, description: 'The ID of the routine to update.' },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'The new name for the routine.' },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'The new list of task titles for the routine.'}
                    }
                }
            },
            required: ['routineId', 'updates']
        }
    }
];