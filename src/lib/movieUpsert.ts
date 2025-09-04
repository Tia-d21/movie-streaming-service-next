import { prisma } from "./prisma";

// This helper now uses the updated schema with posterPath
// and assumes the movie ID is the TMDB ID.
interface MovieData {
  id: string | number;
  title?: string;
  posterPath?: string;
  overview?: string;
  genres?: string[];
  releaseYear?: string | number;
  category?: string;
}

export const movieUpsert = async (movieData: MovieData) => {
  const movieId = parseInt(movieData.id as string, 10);

  // Guard against invalid movieData
  if (!movieData || isNaN(movieId)) {
    throw new Error("Invalid movie data provided to upsert helper.");
  }

  const year = parseInt(String(movieData.releaseYear ?? ""), 10);

  return prisma.movie.upsert({
    where: {
      id: movieId, // The ID is now the TMDB ID, not auto-incremented
    },
    update: {
      // If the movie already exists, we can refresh its details
      title: movieData.title || "Untitled",
      posterPath: movieData.posterPath,
    },
    create: {
      id: movieId, // Use the TMDB ID as the primary key
      title: movieData.title || "Untitled",
      description: movieData.overview || "No overview available.",
      genre: movieData.genres?.join(",") || "General",
      year: isNaN(year) ? 0 : year,
      url: `/watch/${movieData.category}/${movieId}`,
      posterPath: movieData.posterPath, // Save the poster path on creation
    },
  });
};
