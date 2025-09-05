"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../../lib/apiHelper";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

interface UserProfileContextType {
  user: UserProfile | null;
  isLoading: boolean;
  token: string | null;
  login: (token: string, userData: UserProfile) => void;
  logout: () => void;
  // --- [NEW] Add a function to update the user's state ---
  updateUserProfile: (updatedData: Partial<UserProfile>) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("userProfile");
    }
    router.push("/auth/login");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const initializeAuth = async () => {
      const storedToken = window.localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const profileData = await fetchWithAuth("/api/users/me");
          if (profileData && profileData.id) {
            setUser(profileData);
            setToken(storedToken);
            window.localStorage.setItem(
              "userProfile",
              JSON.stringify(profileData)
            );
          } else {
            logout();
          }
        } catch (error) {
          console.error("Session validation failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [logout]);

  const login = (newToken: string, userData: UserProfile) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("authToken", newToken);
      window.localStorage.setItem("userProfile", JSON.stringify(userData));
    }
    setToken(newToken);
    setUser(userData);
  };

  // --- [NEW] This function updates the user state and localStorage ---
  const updateUserProfile = (updatedData: Partial<UserProfile>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      // Also update localStorage so the change persists on refresh
      if (typeof window !== "undefined") {
        window.localStorage.setItem("userProfile", JSON.stringify(newUser));
      }
      return newUser;
    });
  };

  const value = { user, isLoading, token, login, logout, updateUserProfile };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
