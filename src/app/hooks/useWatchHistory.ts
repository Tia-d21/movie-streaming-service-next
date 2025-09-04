import { create } from "zustand";
import { MediaItem } from "../data/mockData";
import { fetchWithAuth } from "../../lib/apiHelper";

// This interface describes the shape of the data after we format it for the UI
interface WatchedItem extends MediaItem {
  watchedAt: string;
}

// This interface describes the raw data coming from our backend API
interface WatchHistoryItemFromAPI {
  watchedAt: string;
  movie: {
    id: number;
    title: string;
    year: number | null;
    posterPath: string | null;
    url: string | null;
  };
}

// This defines the state and actions available in our global store
interface WatchHistoryState {
  history: WatchedItem[];
  isLoading: boolean;
  fetchHistory: () => Promise<void>;
  addToHistory: (item: MediaItem) => Promise<void>;
  removeFromHistory: (itemId: string) => Promise<void>;
}

export const useWatchHistory = create<WatchHistoryState>((set, get) => ({
  history: [],
  isLoading: true,

  fetchHistory: async () => {
    // Only set loading to true if it's not already loading
    if (!get().isLoading) {
      set({ isLoading: true });
    }
    try {
      const data = await fetchWithAuth("/api/watch-history");
      const formattedHistory = (data.history || []).map(
        (item: WatchHistoryItemFromAPI) => ({
          id: item.movie.id.toString(),
          title: item.movie.title,
          posterPath: item.movie.posterPath,
          releaseYear: item.movie.year?.toString() || "N/A",
          watchedAt: item.watchedAt,
          category: item.movie.url?.includes("/tv/") ? "tv" : "movie",
          rating: "N/A", // Not available from this endpoint, so provide a fallback
          // Provide empty fallbacks for other required MediaItem props
          overview: "",
          backdropPath: "",
          genres: [],
          cast: [],
          similar: [],
        })
      );
      set({ history: formattedHistory, isLoading: false });
    } catch (error) {
      // Don't log "Unauthorized" errors that happen during logout race conditions
      if (!(error instanceof Error && error.message.includes("Unauthorized"))) {
        console.error("Failed to fetch watch history:", error);
      }
      set({ isLoading: false, history: [] }); // Clear history on error
    }
  },

  addToHistory: async (item: MediaItem) => {
    try {
      await fetchWithAuth("/api/watch-history", {
        method: "POST",
        body: JSON.stringify(item),
      });
      // After successfully adding, refetch the list to ensure UI consistency
      // This is the key to preventing visual duplicates
      await get().fetchHistory();
    } catch (error) {
      console.error("Failed to add to watch history:", error);
    }
  },

  removeFromHistory: async (itemId: string) => {
    const originalHistory = get().history;
    // Optimistically update the UI for a fast user experience
    set((state) => ({
      history: state.history.filter((item) => item.id !== itemId),
    }));

    try {
      await fetchWithAuth("/api/watch-history", {
        method: "DELETE",
        body: JSON.stringify({ movieId: itemId }),
      });
    } catch (error) {
      console.error("Failed to remove from history:", error);
      // If the API call fails, revert the UI to the original state
      set({ history: originalHistory });
    }
  },
}));
