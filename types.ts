export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum EnergyLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  isSurvival: boolean;
  parentId: string | null;
  createdAt: string;
  priority: Priority;
  dueDate: string | null;
  energyRequired: EnergyLevel;
}

export interface Routine {
  id: string;
  name: string;
  tasks: string[];
}

export enum UIMode {
  Linear = 'Linear',
  MindMap = 'Mind Map',
  LowStimulus = 'Low Stimulus',
  Gamified = 'Gamified',
}

export enum Page {
    Tasks = 'Tasks',
    Routines = 'Routines',
    Settings = 'Settings',
    Assistant = 'Assistant',
}

export type NotificationPermission = 'default' | 'granted' | 'denied';