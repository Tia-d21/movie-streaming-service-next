"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

// The UserProfile type remains the same for the session
export type UserProfile = {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

interface UserProfileContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

const getInitialProfile = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const item = window.localStorage.getItem("userProfile");
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error parsing userProfile from localStorage", error);
    return null;
  }
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getInitialProfile());
    setIsLoading(false);
  }, []);

  const login = (profile: UserProfile) => {
    try {
      // This function's role is to manage the CURRENT session
      window.localStorage.setItem("userProfile", JSON.stringify(profile));
      setUser(profile);
    } catch (error) {
      console.error("Error saving userProfile to localStorage", error);
    }
  };

  // --- THIS IS THE UPDATED LOGOUT LOGIC ---
  const logout = () => {
    try {
      const currentUserEmail = user?.email;

      // Clear the current session
      window.localStorage.removeItem("userProfile");
      setUser(null);

      // --- IMPORTANT: As requested, this section removes the user's registration data. ---
      // In a real-world app, a standard logout would NOT do this. This is more like "Delete Account".
      if (currentUserEmail) {
        const usersJSON = window.localStorage.getItem("registeredUsers");
        const registeredUsers = usersJSON ? JSON.parse(usersJSON) : [];

        // Filter out the user who is logging out
        const updatedUsers = registeredUsers.filter(
          (registeredUser: UserProfile) =>
            registeredUser.email !== currentUserEmail
        );

        // Save the updated list back to localStorage
        window.localStorage.setItem(
          "registeredUsers",
          JSON.stringify(updatedUsers)
        );
        console.log(
          `User ${currentUserEmail} has been logged out and their registration data has been removed.`
        );
      }

      // Also clear other session-related data
      window.localStorage.removeItem("myList");
      window.localStorage.removeItem("favoritesList");
    } catch (error) {
      console.error("Error during logout process", error);
    }
  };
  // --- END OF UPDATED LOGIC ---

  const value = { user, isLoading, login, logout };

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
