const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchTMDB = async (endpoint: string) => {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=en-US`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch TMDB data from ${url}`);
  }
  return res.json();
};
