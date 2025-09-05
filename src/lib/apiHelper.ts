/**
 * A wrapper around the native fetch API for making authenticated requests.
 * It automatically includes the JWT token and correctly merges custom headers.
 *
 * @param {string} url - The API endpoint to call.
 * @param {RequestInit} [options={}] - Standard fetch options (method, body, etc.).
 * @returns {Promise<any>} - A promise that resolves with the JSON response.
 * @throws {Error} - Throws an error if the network response is not ok.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // 1. Initialize a new Headers object. This safely handles any valid
  //    `HeadersInit` type that might be passed in `options.headers`.
  const headers = new Headers(options.headers);

  // 2. Set our default 'Content-Type', but only if a different one wasn't
  //    already provided in the options.
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Get the authentication token from localStorage.
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null;

  // 4. If a token exists, ALWAYS set the 'Authorization' header.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 5. Make the fetch call using the safely constructed headers.
  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  // 6. Handle the response.
  if (!response.ok) {
    // Try to parse the error message from the backend, otherwise throw a generic error.
    const errorData = await response
      .json()
      .catch(() => ({ error: "An API error occurred" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  // Handle responses that might not have a body (e.g., DELETE with 204 No Content).
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Return undefined for non-JSON or empty responses.
  return;
};
