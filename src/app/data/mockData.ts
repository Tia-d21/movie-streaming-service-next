// This is the blueprint for our MediaItem.
// We are ensuring the `trailerKey` property is officially on the blueprint.
export type MediaItem = {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: string;
  rating: string;
  duration?: string;
  episodes?: number;
  seasons?: number;
  category: "movie" | "tv";
  genres: string[];
  cast: {
    name: string;
    character: string;
    profilePath: string;
  }[];
  similar: {
    id: string;
    title: string;
    posterPath: string;
    category: "movie" | "tv";
  }[];

  trailerKey?: string;
};
