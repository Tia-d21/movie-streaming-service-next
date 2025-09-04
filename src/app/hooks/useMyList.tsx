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
interface MovieFromAPI {
  id: number;
  title: string;
  // Add other properties that your API might return for a movie
  posterPath?: string | null;
  releaseYear?: number;
  category?: "movie" | "tv";
  // Include any other relevant fields you expect from the API
}

interface MyListContextType {
  myList: MediaItem[];
  isLoading: boolean;
  addToMyList: (item: MediaItem) => Promise<void>;
  removeFromMyList: (id: string) => Promise<void>;
  isInMyList: (id: string) => boolean;
}

const MyListContext = createContext<MyListContextType | undefined>(undefined);

export const MyListProvider = ({ children }: { children: ReactNode }) => {
  const [myList, setMyList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useUserProfile();

  const fetchMyList = useCallback(async () => {
    if (!token) {
      setMyList([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const listItemsFromApi = await fetchWithAuth("/api/users/mylist");

      // --- [FIX] Apply our new, specific type instead of 'any' ---
      // This also safely formats the data for the MediaItem type.
      const formattedList = listItemsFromApi.map((item: MovieFromAPI) => ({
        ...item, // Spread the properties from the API
        id: item.id.toString(), // Ensure id is a string for frontend consistency
        // Provide fallbacks for any required MediaItem properties not in MovieFromAPI
        overview: "",
        backdropPath: "",
        rating: "",
        genres: [],
        cast: [],
        similar: [],
      }));
      setMyList(formattedList);
    } catch (error) {
      console.error("Failed to fetch My List:", error);
      setMyList([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyList();
  }, [fetchMyList]);

  const addToMyList = async (item: MediaItem) => {
    if (myList.some((i) => i.id === item.id)) return;
    try {
      await fetchWithAuth("/api/users/mylist", {
        method: "POST",
        body: JSON.stringify(item),
      });
      setMyList((prev) => [...prev, item]);
    } catch (error) {
      console.error("Failed to add to My List:", error);
    }
  };

  const removeFromMyList = async (id: string) => {
    try {
      const movieId = parseInt(id, 10);
      await fetchWithAuth("/api/users/mylist", {
        method: "DELETE",
        body: JSON.stringify({ movieId }),
      });
      setMyList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove from My List:", error);
    }
  };

  const isInMyList = (id: string) => {
    return myList.some((item) => item.id === id);
  };

  const value = {
    myList,
    isLoading,
    addToMyList,
    removeFromMyList,
    isInMyList,
  };

  return (
    <MyListContext.Provider value={value}>{children}</MyListContext.Provider>
  );
};

export const useMyList = () => {
  const context = useContext(MyListContext);
  if (context === undefined) {
    throw new Error("useMyList must be used within a MyListProvider");
  }
  return context;
};
