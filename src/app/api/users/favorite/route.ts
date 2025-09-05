import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "middlewares/auth";
import { prisma } from "lib/prisma";
import { movieUpsert } from "lib/movieUpsert";
// --- [FIX] Import the necessary types from Prisma Client ---
import { Prisma } from "@prisma/client";

// This is a helper type that describes the shape of a Favorite with its related Movie
type FavoriteWithMovie = Prisma.FavoriteGetPayload<{
  include: { movie: true }
}>

// GET all favorites of logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
    });

    // --- [FIX] Use our new, specific type instead of 'any' ---
    const favoriteMovies = favorites.map((fav: FavoriteWithMovie) => {
      const category = fav.movie.url?.includes("/tv/") ? "tv" : "movie";
      return {
        ...fav.movie,
        category: category,
      };
    });

    return NextResponse.json(favoriteMovies);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST add a movie to favorites
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const movieData = await req.json();
    const movie = await movieUpsert(movieData);
    const movieId = movie.id;

    const existing = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId: user.userId, movieId } },
    });

    if (existing) {
      // Return the existing movie to keep the frontend consistent
      return NextResponse.json(movie);
    }

    const favorite = await prisma.favorite.create({
      data: { userId: user.userId, movieId },
      include: { movie: true },
    });

    return NextResponse.json(favorite.movie, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE remove a movie from favorites
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId)
      return NextResponse.json(
        { error: "movieId is required" },
        { status: 400 }
      );

    await prisma.favorite.delete({
      where: { userId_movieId: { userId: user.userId, movieId: parseInt(movieId, 10) } },
    });

    return new NextResponse(null, { status: 204 }); // Use 204 for successful deletion
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}