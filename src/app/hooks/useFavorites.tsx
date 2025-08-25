"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { MediaItem } from "../../app/data/mockData";

// Define the shape of the data and functions our context will provide
interface FavoritesContextType {
  favorites: MediaItem[];
  isLoading: boolean;
  addToFavorites: (item: MediaItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: MediaItem) => void;
}

// 1. Create the context to hold our shared state
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const getInitialFavorites = (): MediaItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const item = window.localStorage.getItem("favoritesList");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error parsing favoritesList from localStorage", error);
    return [];
  }
};

// 2. Create the Provider component that will wrap our application
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFavorites(getInitialFavorites());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        window.localStorage.setItem("favoritesList", JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favoritesList to localStorage", error);
      }
    }
  }, [favorites, isLoading]);

  const addToFavorites = (item: MediaItem) => {
    setFavorites((prevList) => {
      if (prevList.some((media) => media.id === item.id)) {
        return prevList;
      }
      return [...prevList, item];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prevList) => prevList.filter((item) => item.id !== id));
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = (item: MediaItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const value = {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// 3. The hook now simply consumes the shared context, making it globally aware
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
