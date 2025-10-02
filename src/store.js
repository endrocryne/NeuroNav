import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the store
export const useAppStore = create(
  persist(
    (set) => ({
      // --- Onboarding State ---
      hasOnboarded: false,
      completeOnboarding: () => set({ hasOnboarded: true }),

      // --- Today Screen State ---
      energyLevel: 3, // Default to medium energy (1-5 scale)
      mood: 'okay', // 'happy', 'okay', 'overwhelmed', 'tired'
      setEnergyLevel: (level) => set({ energyLevel: level }),
      setMood: (mood) => set({ mood: mood }),

      // --- Task Breakdown Dialog State ---
      isTaskBreakdownOpen: false,
      openTaskBreakdown: () => set({ isTaskBreakdownOpen: true }),
      closeTaskBreakdown: () => set({ isTaskBreakdownOpen: false }),

      // --- Settings State ---
      focusMode: 'default', // 'default', 'mindmap', 'lowstim', 'gamified'
      enableEncouragement: true,
      setFocusMode: (mode) => set({ focusMode: mode }),
      setEnableEncouragement: (enabled) => set({ enableEncouragement: enabled }),

      // --- Gamified Mode State ---
      showConfetti: false,
      triggerConfetti: () => {
        set({ showConfetti: true });
        setTimeout(() => set({ showConfetti: false }), 4000); // Hide after 4 seconds
      },
    }),
    {
      name: 'neuronav-storage', // Name of the item in localStorage
    }
  )
);