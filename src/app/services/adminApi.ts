import { UserProfile } from "../hooks/useUserProfile";
import { fetchWithAuth } from "@/lib/apiHelper";

const BASE_URL = "/api";

// Extend UserProfile with server fields
export interface User extends UserProfile {
  id: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  favorites: Favorite[];
  mylist: MyListItem[];
  ratings: Rating[];
  feedbacks: Feedback[];
}

// Define proper interfaces instead of using 'any'
export interface Favorite {
  movieId: string;
  createdAt: string;
}

export interface MyListItem {
  movieId: string;
  status: string;
  createdAt: string;
}

export interface Rating {
  movieId: string;
  value: number;
  createdAt: string;
}

export interface Feedback {
  id: string;
  movieId: string;
  message: string;
  createdAt: string;
}

// Payload for creating a new user
export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}

// Payload for updating a user
export interface UpdateUser {
  name?: string;
  email?: string;
  password?: string;
  role?: "USER" | "ADMIN";
}

// --- API Calls ---

// GET all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  return fetchWithAuth(`${BASE_URL}/users`);
};

// POST create new user (admin only)
export const addUser = async (userData: NewUser): Promise<User> => {
  return fetchWithAuth(`${BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// PUT update user (admin only)
export const updateUser = async (
  userId: string,
  userData: UpdateUser
): Promise<User> => {
  return fetchWithAuth(`${BASE_URL}/users`, {
    method: "PUT",
    body: JSON.stringify({
      id: userId,
      ...userData
    }),
  });
};

// DELETE user (admin only)
export const deleteUser = async (
  userId: string
): Promise<{ message: string; user: User }> => {
  return fetchWithAuth(`${BASE_URL}/users?id=${userId}`, {
    method: "DELETE",
  });
};

// --- Admin Stats (optional dashboard data) ---
export interface AdminStats {
  totalUsers: number;
  totalMovies: number;
  totalFavorites: number;
  totalMyList: number;
  totalRatings: number;
  totalFeedbacks: number;
}

// GET admin dashboard stats
export const getAdminStats = async (): Promise<AdminStats> => {
  return fetchWithAuth(`${BASE_URL}/admin/dashboard`);
};