export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = typeof window !== "undefined" ? window.localStorage.getItem("authToken") : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "An API error occurred" }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) return response.json();

  return;
};

export interface ChangePasswordPayload {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  return fetchWithAuth(`/api/users/${payload.userId}/password-change`, {
    method: "PUT",
    body: JSON.stringify({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    }),
  });
};
