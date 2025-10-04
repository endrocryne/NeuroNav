import Dexie, { type Table } from 'dexie';

export interface Task {
  id?: number;
  text: string;
  completed: boolean;
  date: string; // ISO date string
  tags: string[]; // e.g., ['#survival']
  project?: string;
  parentTask?: string; // Original task text for sub-tasks
  order?: number;
  createdAt: number;
}

export interface Routine {
  id?: number;
  name: string;
  tasks: string[];
  createdAt: number;
}

export interface Settings {
  id?: number;
  hasSeenWelcome: boolean;
  viewMode: 'default' | 'mindmap' | 'lowstim' | 'gamified';
  enableEncouragement: boolean;
}

export class NeuroNavDB extends Dexie {
  tasks!: Table<Task>;
  routines!: Table<Routine>;
  settings!: Table<Settings>;

  constructor() {
    super('NeuroNavDB');
    this.version(1).stores({
      tasks: '++id, text, completed, date, *tags, project, parentTask, order, createdAt',
      routines: '++id, name, createdAt',
      settings: '++id'
    });
  }
}

export const db = new NeuroNavDB();
