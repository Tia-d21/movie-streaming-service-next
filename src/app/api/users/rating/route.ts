import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "middlewares/auth";
import { prisma } from "lib/prisma";
import { movieUpsert } from "lib/movieUpsert"; // Import our helper

// GET all ratings of logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ratings = await prisma.rating.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST add/update rating
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // MODIFICATION: Expect an object with movieData and the rating value
    const { movieData, value } = await req.json();
    const movieId = parseInt(movieData.id, 10);

    if (!movieData || !value || value < 1 || value > 5 || isNaN(movieId)) {
      return NextResponse.json(
        { error: "Movie data and a rating value (1-5) are required" },
        { status: 400 }
      );
    }

    // MODIFICATION: Upsert the movie before proceeding
    await movieUpsert(movieData);

    // Now, safely create or update the rating
    const rating = await prisma.rating.upsert({
      where: { userId_movieId: { userId: user.userId, movieId } },
      update: { value },
      create: { userId: user.userId, movieId, value },
      include: { movie: true },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error adding/updating rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE rating
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

    await prisma.rating.delete({
      where: {
        userId_movieId: { userId: user.userId, movieId: parseInt(movieId, 10) },
      },
    });

    return NextResponse.json({ message: "Rating deleted successfully" });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
