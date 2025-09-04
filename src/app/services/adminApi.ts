import { UserProfile } from "../hooks/useUserProfile";
import { fetchWithAuth } from "../../lib/apiHelper";

const BASE_URL = "/api";

// Extend UserProfile with server fields
export interface User extends UserProfile {
  id: string;
  role: "USER" | "ADMIN";
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

export const getAllUsers = async (): Promise<User[]> => {
  return fetchWithAuth(`${BASE_URL}/users`);
};

export const addUser = async (userData: NewUser): Promise<User> => {
  return fetchWithAuth(`${BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (
  userId: string,
  userData: UpdateUser
): Promise<User> => {
  return fetchWithAuth(`${BASE_URL}/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (
  userId: string
): Promise<{ message: string; user: User }> => {
  return fetchWithAuth(`${BASE_URL}/users/${userId}`, {
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

export const getAdminStats = async (): Promise<AdminStats> => {
  return fetchWithAuth(`${BASE_URL}/admin/dashboard`);
};
