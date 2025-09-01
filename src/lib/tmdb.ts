const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchTMDB = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
  if (!res.ok) {
    throw new Error("Failed to fetch TMDB data");
  }
  return res.json();
};
