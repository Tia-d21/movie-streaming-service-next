import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";

// GETs the current user's rating for a specific movie.
export async function GET(req: NextRequest, { params }: { params: { movieId: string } }) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movieId = parseInt(params.movieId, 10);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const rating = await prisma.rating.findUnique({
      where: {
        // Use the compound unique key to find the specific rating
        userId_movieId: {
          userId: user.userId,
          movieId: movieId,
        },
      },
    });

    // It's not an error if a rating isn't found, it just means the user hasn't rated it.
    if (!rating) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(rating);

  } catch (error) {
    console.error(`Error fetching rating for movie ${params.movieId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}