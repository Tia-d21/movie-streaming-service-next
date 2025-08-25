"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { MediaItem } from "../../app/data/mockData";
interface MyListContextType {
  myList: MediaItem[];
  isLoading: boolean;
  addToMyList: (item: MediaItem) => void;
  removeFromMyList: (id: string) => void;
  isInMyList: (id: string) => boolean;
}
const MyListContext = createContext<MyListContextType | undefined>(undefined);
const getInitialMyList = (): MediaItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const item = window.localStorage.getItem("myList");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error parsing myList from localStorage", error);
    return [];
  }
};
export const MyListProvider = ({ children }: { children: ReactNode }) => {
  const [myList, setMyList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setMyList(getInitialMyList());
    setIsLoading(false);
  }, []);
  useEffect(() => {
    if (!isLoading) {
      try {
        window.localStorage.setItem("myList", JSON.stringify(myList));
      } catch (error) {
        console.error("Error saving myList to localStorage", error);
      }
    }
  }, [myList, isLoading]);
  const addToMyList = (item: MediaItem) => {
    setMyList((prevList) => {
      if (prevList.some((movie) => movie.id === item.id)) {
        return prevList;
      }
      return [...prevList, item];
    });
  };
  const removeFromMyList = (id: string) => {
    setMyList((prevList) => prevList.filter((item) => item.id !== id));
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
