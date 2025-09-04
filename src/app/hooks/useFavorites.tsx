"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { MediaItem } from "../../app/data/mockData";
import { useUserProfile } from "./useUserProfile";
import { fetchWithAuth } from "../../lib/apiHelper";

// --- [FIX] Define the shape of a movie item coming from our backend API ---
// We can reuse this interface across hooks if it's the same shape.
interface MovieFromAPI {
  id: number;
  title: string;
  posterPath?: string | null;
  releaseYear?: number;
  category?: "movie" | "tv";
}

interface FavoritesContextType {
  favorites: MediaItem[];
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: MediaItem) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useUserProfile();

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchWithAuth("/api/users/favorite");

      // --- [FIX] Apply our new, specific type instead of 'any' ---
      const formattedList = data.map((item: MovieFromAPI) => ({
        ...item, // Spread properties from the API
        id: item.id.toString(), // Ensure id is a string
        // Provide fallbacks for any required MediaItem properties
        overview: "",
        backdropPath: "",
        rating: "",
        genres: [],
        cast: [],
        similar: [],
      }));
      setFavorites(formattedList);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = (id: string): boolean => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = async (item: MediaItem) => {
    const currentlyFavorite = isFavorite(item.id);
    const movieId = parseInt(item.id, 10);

    if (currentlyFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== item.id));
    } else {
      setFavorites((prev) => [...prev, item]);
    }

    try {
      if (currentlyFavorite) {
        await fetchWithAuth("/api/users/favorite", {
          method: "DELETE",
          body: JSON.stringify({ movieId }),
        });
      } else {
        await fetchWithAuth("/api/users/favorite", {
          method: "POST",
          body: JSON.stringify(item),
        });
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      fetchFavorites();
    }
  };

  const value = {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
