import { MediaItem } from "../data/mockData";

// TODO: DEPLOYMENT SETUP - TMDB API Integration
// 1. Get your free API key from: https://www.themoviedb.org/settings/api
// 2. For Vercel deployment: Add NEXT_PUBLIC_TMDB_API_KEY in environment variables
// 3. For Render backend: Add TMDB_API_KEY in environment variables
// 4. Replace the placeholder key below with your actual TMDB API key
// 5. The app will automatically switch from mock data to real TMDB data
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

// --- INTERFACES ---
interface TMDBVideo {
  site: string;
  type: string;
  key: string;
}
interface TMDBCast {
  name: string;
  character: string;
  profile_path: string | null;
}
interface TMDBGenre {
  id: number;
  name: string;
}
interface TMDBRecommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  media_type?: string;
}
interface TMDBItem {
  id: number | string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  adult?: boolean;
  runtime?: number;
  number_of_seasons?: number;
  media_type?: string;
  genres?: TMDBGenre[];
  genre_ids?: number[];
  credits?: { cast: TMDBCast[] };
  recommendations?: { results: TMDBRecommendation[] };
  videos?: { results: TMDBVideo[] };
}
interface TMDBResults {
  results: TMDBItem[];
  page: number;
  total_pages: number;
}
export interface PaginatedResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
}

// --- CORE FUNCTIONS ---
const formatMediaItem = (item: TMDBItem): MediaItem => {
  const genreIds = item.genres
    ? item.genres.map((g) => g.id)
    : item.genre_ids || [];
  return {
    id: item.id.toString(),
    title: item.title || item.name || "Untitled",
    overview: item.overview ?? "No overview available.",
    posterPath: item.poster_path
      ? `${IMAGE_BASE_URL}w500${item.poster_path}`
      : "/poster-placeholder.svg",
    backdropPath: item.backdrop_path
      ? `${IMAGE_BASE_URL}original${item.backdrop_path}`
      : "/backdrop-placeholder.svg",
    releaseYear:
      (item.release_date || item.first_air_date)?.substring(0, 4) || "N/A",
    rating: item.adult ? "18+" : "PG-13",
    duration: item.runtime
      ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
      : undefined,
    seasons: item.number_of_seasons,
    category: item.media_type === "movie" || item.title ? "movie" : "tv",
    genres: genreIds,
    cast:
      item.credits?.cast
        .slice(0, 6)
        .map((c: TMDBCast) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path
            ? `${IMAGE_BASE_URL}w185${c.profile_path}`
            : "/poster-placeholder.svg",
        })) || [],
    similar:
      item.recommendations?.results.map((r: TMDBRecommendation) => ({
        id: r.id.toString(),
        title: r.title || r.name || "Untitled",
        posterPath: r.poster_path
          ? `${IMAGE_BASE_URL}w500${r.poster_path}`
          : "/poster-placeholder.svg",
        category: r.media_type === "movie" || r.title ? "movie" : "tv",
      })) || [],
    trailerKey: item.videos?.results.find((v) => v.site === "YouTube")?.key,
  };
};

const fetchFromTMDB = async (
  endpoint: string,
  params: string = ""
): Promise<TMDBResults | TMDBItem | null> => {
  try {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    return null;
  }
};

// --- EXPORTED API FUNCTIONS ---

export const fetchMediaDetails = async (
  id: string,
  category: "movie" | "tv"
): Promise<MediaItem | null> => {
  const details = await fetchFromTMDB(
    `/${category}/${id}`,
    "append_to_response=credits,recommendations,videos"
  );
  return details ? formatMediaItem(details as TMDBItem) : null;
};


export const getGenreList = async (
  type: "movie" | "tv"
): Promise<{ id: number; name: string }[]> => {
  const data = await fetchFromTMDB(`/genre/${type}/list`);
  return (data as { genres: { id: number; name: string }[] })?.genres || [];
};

// --- PAGINATED FUNCTIONS (For Browse Page Infinite Scroll) ---

export const fetchTrendingByPage = async (
  page: number
): Promise<PaginatedResponse> => {
  const data = (await fetchFromTMDB(
    "/trending/all/week",
    `page=${page}`
  )) as TMDBResults;
  return {
    results: data?.results?.map(formatMediaItem) ?? [],
    page: data?.page ?? 1,
    totalPages: data?.total_pages ?? 1,
  };
};

export const fetchPopularMoviesByPage = async (
  page: number
): Promise<PaginatedResponse> => {
  const data = (await fetchFromTMDB(
    "/movie/popular",
    `page=${page}`
  )) as TMDBResults;
  return {
    results: data?.results?.map(formatMediaItem) ?? [],
    page: data?.page ?? 1,
    totalPages: data?.total_pages ?? 1,
  };
};

export const fetchTopRatedShowsByPage = async (
  page: number
): Promise<PaginatedResponse> => {
  const data = (await fetchFromTMDB(
    "/tv/top_rated",
    `page=${page}`
  )) as TMDBResults;
  return {
    results: data?.results?.map(formatMediaItem) ?? [],
    page: data?.page ?? 1,
    totalPages: data?.total_pages ?? 1,
  };
};

export const fetchUpcomingMoviesByPage = async (
  page: number
): Promise<PaginatedResponse> => {
  const data = (await fetchFromTMDB(
    "/movie/upcoming",
    `page=${page}`
  )) as TMDBResults;
  return {
    results: data?.results?.map(formatMediaItem) ?? [],
    page: data?.page ?? 1,
    totalPages: data?.total_pages ?? 1,
  };
};

export const fetchMediaByGenreByPage = async (
  type: "movie" | "tv",
  genreId: number,
  page: number
): Promise<PaginatedResponse> => {
  const data = (await fetchFromTMDB(
    `/discover/${type}`,
    `sort_by=popularity.desc&with_genres=${genreId}&page=${page}`
  )) as TMDBResults;
  return {
    results: data?.results?.map(formatMediaItem) ?? [],
    page: data?.page ?? 1,
    totalPages: data?.total_pages ?? 1,
  };
};

// --- NON-PAGINATED FUNCTIONS (For Search Page) ---

export const discoverMedia = async (
  type: "movie" | "tv",
  year?: string,
  genres?: number[]
): Promise<MediaItem[]> => {
  const endpoint = `/discover/${type}`;
  let params = "sort_by=popularity.desc&page=1"; // Fetch only first page for initial discover
  if (year) {
    const yearParam =
      type === "movie" ? "primary_release_year" : "first_air_date_year";
    params += `&${yearParam}=${year}`;
  }
  if (genres && genres.length > 0) {
    params += `&with_genres=${genres.join(",")}`;
  }
  const data = await fetchFromTMDB(endpoint, params);
  return (data as TMDBResults)?.results?.map(formatMediaItem) ?? [];
};

export const searchMedia = async (
  query: string,
  filter: "all" | "movie" | "tv"
): Promise<MediaItem[]> => {
  const endpoint =
    filter === "movie"
      ? "/search/movie"
      : filter === "tv"
      ? "/search/tv"
      : "/search/multi";
  const data = await fetchFromTMDB(
    endpoint,
    `query=${encodeURIComponent(query)}&page=1`
  );
  const mediaResults =
    (data as TMDBResults)?.results?.filter(
      (item: TMDBItem) => item.media_type !== "person" && item.poster_path
    ) ?? [];
  return mediaResults.map(formatMediaItem);
};
