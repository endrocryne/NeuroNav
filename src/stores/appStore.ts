import { create } from 'zustand';

export type ViewMode = 'default' | 'mindmap' | 'lowstim' | 'gamified';
export type Mood = 'happy' | 'okay' | 'overwhelmed' | 'tired';

interface AppState {
  energyLevel: number;
  mood: Mood | null;
  viewMode: ViewMode;
  enableEncouragement: boolean;
  hasSeenWelcome: boolean;
  setEnergyLevel: (level: number) => void;
  setMood: (mood: Mood) => void;
  setViewMode: (mode: ViewMode) => void;
  setEnableEncouragement: (enable: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  energyLevel: 3,
  mood: null,
  viewMode: 'default',
  enableEncouragement: true,
  hasSeenWelcome: false,
  setEnergyLevel: (level) => set({ energyLevel: level }),
  setMood: (mood) => set({ mood }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setEnableEncouragement: (enable) => set({ enableEncouragement: enable }),
  setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
}));
