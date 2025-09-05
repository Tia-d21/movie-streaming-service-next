// src/app/services/adminApi.ts

import { UserProfile } from "../hooks/useUserProfile";
import { fetchWithAuth } from "../../lib/apiHelper";

const BASE_URL = "/api";

export interface User extends UserProfile {
  id: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export const getAllUsers = async (): Promise<User[]> => {
  // Use the centralized fetchWithAuth function which handles the token
  return fetchWithAuth(`${BASE_URL}/users`);
};

export const addUser = async (
  userData: Omit<User, "id" | "createdAt">
): Promise<User> => {
  return fetchWithAuth(`${BASE_URL}/users`, {
    method: "POST",
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
