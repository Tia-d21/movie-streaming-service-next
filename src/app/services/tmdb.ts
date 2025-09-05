import { MediaItem } from "../data/mockData";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

export interface PaginatedResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
}

// --- Type interfaces for raw TMDB API response ---

interface TMDBGenre {
  id: number;
  name: string;
}
interface TMDBCast {
  name: string;
  character: string;
  profile_path: string | null;
}
interface TMDBVideo {
  site: string;
  type: string;
  key: string;
}
interface TMDBRecommendation {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
}

interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  runtime?: number;
  number_of_seasons?: number;
  media_type?: "movie" | "tv" | "person"; // Added 'person' to handle search results
  genres?: TMDBGenre[];
  credits?: { cast: TMDBCast[] };
  recommendations?: { results: TMDBRecommendation[] };
  videos?: { results: TMDBVideo[] };
}

interface TMDBPaginatedResponse {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

const formatMediaItem = (item: TMDBMediaItem): MediaItem => {
  const category =
    item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
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
    rating: item.vote_average ? item.vote_average.toFixed(1) : "N/A",
    duration: item.runtime
      ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
      : undefined,
    seasons: item.number_of_seasons,
    category: category,
    genres: (item.genres || []).map((g: TMDBGenre) => g.id),
    cast: (item.credits?.cast || []).slice(0, 6).map((c: TMDBCast) => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path
        ? `${IMAGE_BASE_URL}w185${c.profile_path}`
        : "/poster-placeholder.svg",
    })),
    similar: (item.recommendations?.results || []).map(
      (r: TMDBRecommendation) => ({
        id: r.id.toString(),
        title: r.title || r.name || "Untitled",
        posterPath: r.poster_path
          ? `${IMAGE_BASE_URL}w500${r.poster_path}`
          : "/poster-placeholder.svg",
        category: r.media_type === "tv" || r.name ? "tv" : "movie",
      })
    ),
    trailerKey: item.videos?.results.find(
      (v: TMDBVideo) => v.site === "YouTube" && v.type === "Trailer"
    )?.key,
  };
};

const fetchMediaList = async (
  type: string,
  page: number = 1
): Promise<PaginatedResponse> => {
  try {
    const response = await fetch(`/api/tmdb/movies?type=${type}&page=${page}`);
    if (!response.ok) throw new Error(`Failed to fetch ${type} from proxy`);
    const data: TMDBPaginatedResponse = await response.json();
    return {
      results: data.results.map(formatMediaItem),
      page: data.page,
      totalPages: data.total_pages,
    };
  } catch (error) {
    console.error(`Error in fetchMediaList for ${type}:`, error);
    return { results: [], page: 1, totalPages: 1 };
  }
};

export const fetchTrendingByPage = (page: number) =>
  fetchMediaList("trending", page);
export const fetchPopularMoviesByPage = (page: number) =>
  fetchMediaList("popular", page);
export const fetchTopRatedShowsByPage = (page: number) =>
  fetchMediaList("popular-tv", page);
export const fetchUpcomingMoviesByPage = (page: number) =>
  fetchMediaList("upcoming", page);

export const fetchMediaDetails = async (
  id: string,
  category: "movie" | "tv"
): Promise<MediaItem | null> => {
  try {
    const response = await fetch(`/api/tmdb/details/${category}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch details from proxy");
    const data: TMDBMediaItem = await response.json();
    return formatMediaItem(data);
  } catch (error) {
    console.error(`Error fetching details for ${category}/${id}:`, error);
    return null;
  }
};

export const fetchMediaByGenreByPage = async (
  mediaType: "movie" | "tv",
  genreId: number,
  page: number
): Promise<PaginatedResponse> => {
  try {
    const response = await fetch(
      `/api/tmdb/discover?mediaType=${mediaType}&genreId=${genreId}&page=${page}`
    );
    if (!response.ok) throw new Error("Failed to fetch by genre from proxy");
    const data: TMDBPaginatedResponse = await response.json();
    return {
      results: data.results.map(formatMediaItem),
      page: data.page,
      totalPages: data.total_pages,
    };
  } catch (error) {
    console.error(
      `Error in fetchMediaByGenreByPage for genre ${genreId}:`,
      error
    );
    return { results: [], page: 1, totalPages: 1 };
  }
};

// --- [FIXED] searchMedia function is now fully type-safe ---
export const searchMedia = async (
  query: string,
  filter: "all" | "movie" | "tv"
): Promise<MediaItem[]> => {
  try {
    const mediaType = filter === "all" ? "multi" : filter;
    const response = await fetch(
      `/api/tmdb/search?query=${encodeURIComponent(
        query
      )}&mediaType=${mediaType}`
    );
    if (!response.ok) throw new Error("Failed to search from proxy");

    const data: TMDBPaginatedResponse = await response.json();

    // Filter out people from 'multi' search results using the correct type
    const validResults = data.results.filter(
      (item: TMDBMediaItem) => item.media_type !== "person"
    );

    return validResults.map(formatMediaItem);
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
};

export const discoverMedia = async (
  mediaType: "movie" | "tv",
  year?: string,
  genres?: number[]
): Promise<MediaItem[]> => {
  try {
    const params = new URLSearchParams();
    params.append("mediaType", mediaType);
    if (year) params.append("year", year);
    if (genres && genres.length > 0)
      params.append("genreIds", genres.join(","));

    const response = await fetch(`/api/tmdb/discover?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to discover from proxy");

    const data: TMDBPaginatedResponse = await response.json();
    return data.results.map(formatMediaItem);
  } catch (error) {
    console.error(`Error discovering ${mediaType}:`, error);
    return [];
  }
};

export const getGenreList = async (
  mediaType: "movie" | "tv"
): Promise<TMDBGenre[]> => {
  try {
    const response = await fetch(`/api/tmdb/genres/${mediaType}`);
    if (!response.ok) throw new Error("Failed to fetch genres from proxy");
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error(`Error fetching genres for ${mediaType}:`, error);
    return [];
  }
};
