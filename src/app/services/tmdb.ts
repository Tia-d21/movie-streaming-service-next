import { MediaItem } from "../data/mockData";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

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
  credits?: { cast: TMDBCast[] };
  recommendations?: { results: TMDBRecommendation[] };
  videos?: { results: TMDBVideo[] };
}

interface TMDBResults {
  results: TMDBItem[];
  [key: string]: unknown;
}

const formatMediaItem = (item: TMDBItem): MediaItem => {
  let officialTrailer = null;
  if (item.videos?.results) {
    officialTrailer = item.videos.results.find(
      (video: TMDBVideo) => video.site === "YouTube" && video.type === "Trailer"
    );
    if (!officialTrailer) {
      officialTrailer = item.videos.results.find(
        (video: TMDBVideo) =>
          video.site === "YouTube" && video.type === "Teaser"
      );
    }
    if (!officialTrailer) {
      officialTrailer = item.videos.results.find(
        (video: TMDBVideo) => video.site === "YouTube"
      );
    }
  }

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
    genres: item.genres?.map((g: TMDBGenre) => g.name) || [],
    cast:
      item.credits?.cast.slice(0, 6).map((c: TMDBCast) => ({
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
    trailerKey: officialTrailer?.key,
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
      console.error(`Failed to fetch from endpoint: ${endpoint}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchMediaDetails = async (
  id: string,
  category: "movie" | "tv"
): Promise<MediaItem | null> => {
  const details = await fetchFromTMDB(
    `/${category}/${id}`,
    "append_to_response=credits,recommendations,videos"
  );
  if (!details) return null;
  return formatMediaItem(details as TMDBItem);
};

export const fetchTrending = async (): Promise<MediaItem[]> => {
  const data = await fetchFromTMDB("/trending/all/week");
  return (data as TMDBResults)?.results?.map(formatMediaItem) ?? [];
};

export const fetchPopularMovies = async (): Promise<MediaItem[]> => {
  const data = await fetchFromTMDB("/movie/popular");
  return (data as TMDBResults)?.results?.map(formatMediaItem) ?? [];
};

export const fetchTopRatedShows = async (): Promise<MediaItem[]> => {
  const data = await fetchFromTMDB("/tv/top_rated");
  return (data as TMDBResults)?.results?.map(formatMediaItem) ?? [];
};

export const fetchUpcomingMovies = async (): Promise<MediaItem[]> => {
  const data = await fetchFromTMDB("/movie/upcoming");
  return (data as TMDBResults)?.results?.map(formatMediaItem) ?? [];
};

export const searchMedia = async (
  query: string,
  filter: "all" | "movie" | "tv"
): Promise<MediaItem[]> => {
  let endpoint = "";
  switch (filter) {
    case "movie":
      endpoint = "/search/movie";
      break;
    case "tv":
      endpoint = "/search/tv";
      break;
    case "all":
    default:
      endpoint = "/search/multi";
      break;
  }

  const data = await fetchFromTMDB(
    endpoint,
    `query=${encodeURIComponent(query)}`
  );
  const mediaResults =
    (data as TMDBResults)?.results?.filter(
      (item: TMDBItem) => item.media_type !== "person" && item.poster_path
    ) ?? [];
  return mediaResults.map(formatMediaItem);
};
