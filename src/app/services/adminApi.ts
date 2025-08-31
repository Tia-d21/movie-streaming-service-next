// src/app/services/adminApi.ts

import { UserProfile } from "../hooks/useUserProfile";

const BASE_URL = "/api";

// Helper to get the auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken"); // Assuming you store the JWT token here upon login
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface User extends UserProfile {
  id: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch(`${BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users or insufficient permissions.");
  }
  return response.json();
};

export const addUser = async (
  userData: Omit<User, "id" | "createdAt">
): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add user.");
  }
  return response.json();
};

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete user.");
  }
};
