import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { movieUpsert } from "@/lib/movieUpsert";

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const history = await prisma.watchHistory.findMany({
      where: { userId: user.userId },
      orderBy: { watchedAt: "desc" },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            year: true,
            posterPath: true,
            url: true,
          },
        },
      },
    });
    return NextResponse.json({ history });
  } catch (err) {
    console.error("Error fetching watch history:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------- POST add/update watch history ----------------
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const movieData = await req.json();
    const movie = await movieUpsert(movieData);
    const movieId = movie.id;

    // The TypeScript error here will now be resolved.
    const historyEntry = await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId: user.userId,
          movieId: movieId,
        },
      },
      update: { watchedAt: new Date() },
      create: { userId: user.userId, movieId: movieId, watchedAt: new Date() },
    });

    return NextResponse.json(historyEntry, { status: 201 });
  } catch (err) {
    console.error("Error adding to watch history:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "movieId is required" },
        { status: 400 }
      );
    }
    await prisma.watchHistory.deleteMany({
      where: {
        userId: user.userId,
        movieId: parseInt(movieId, 10),
      },
    });
    return NextResponse.json({ message: "Removed from watch history" });
  } catch (error) {
    console.error("Error deleting watch history item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
