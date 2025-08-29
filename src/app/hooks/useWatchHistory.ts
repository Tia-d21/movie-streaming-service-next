// src/app/hooks/useWatchHistory.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaItem } from "../data/mockData";

export interface WatchedItem extends MediaItem {
  watchedAt: string;
}

interface WatchHistoryState {
  history: WatchedItem[];
  addToHistory: (item: MediaItem) => void;
  removeFromHistory: (itemId: string) => void; // <-- ADD THIS
  clearHistory: () => void;
}

export const useWatchHistory = create<WatchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (item: MediaItem) => {
        const currentHistory = get().history;
        const filteredHistory = currentHistory.filter(
          (i: WatchedItem) => i.id !== item.id
        );
        const newItem: WatchedItem = {
          ...item,
          watchedAt: new Date().toISOString(),
        };
        set({ history: [newItem, ...filteredHistory] });
      },

      // --- NEW: Function to remove a single item from history ---
      removeFromHistory: (itemId: string) => {
        const currentHistory = get().history;
        const updatedHistory = currentHistory.filter(
          (i: WatchedItem) => i.id !== itemId
        );
        set({ history: updatedHistory });
      },
      // --- END OF NEW FUNCTION ---

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "watch-history-storage",
    }
  )
);
