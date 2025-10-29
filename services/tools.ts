import { FunctionDeclaration, Type } from '@google/genai';
import { UIMode, EnergyLevel, Priority } from '../types';

export const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'getTasks',
        description: 'Get all tasks',
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
                title: { type: Type.STRING, description: 'Task title' },
                parentId: { type: Type.STRING, description: 'Parent task ID for subtasks' },
            },
            required: ['title']
        }
    },
    {
        name: 'updateTask',
        description: 'Update task properties',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING, description: 'Task ID' },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        dueDate: { type: Type.STRING, description: 'Due date (YYYY-MM-DD)' },
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
        description: 'Mark task as complete or incomplete',
        parameters: {
            type: Type.OBJECT,
            properties: {
                taskId: { type: Type.STRING, description: 'Task ID' },
                completed: { type: Type.BOOLEAN, description: 'Completion status' },
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
                taskId: { type: Type.STRING, description: 'Task ID' }
            },
            required: ['taskId']
        }
    },
    {
        name: 'setUiMode',
        description: 'Change UI mode',
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
        description: 'Update energy level',
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
        description: 'Apply routine',
        parameters: {
            type: Type.OBJECT,
            properties: {
                routineId: { type: Type.STRING, description: 'Routine ID' }
            },
            required: ['routineId']
        }
    },
    {
        name: 'updateRoutine',
        description: 'Update routine',
        parameters: {
            type: Type.OBJECT,
            properties: {
                routineId: { type: Type.STRING, description: 'Routine ID' },
                updates: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'Routine name' },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Task titles'}
                    }
                }
            },
            required: ['routineId', 'updates']
        }
    }
];