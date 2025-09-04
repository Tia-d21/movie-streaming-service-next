import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "middlewares/auth";
import { prisma } from "lib/prisma";
import { movieUpsert } from "lib/movieUpsert";
// --- [FIX] Import the necessary types from Prisma Client ---
import { Prisma } from "@prisma/client";

// This is a helper type that describes the shape of a MyList item with its related Movie
type MyListWithMovie = Prisma.MyListGetPayload<{
  include: { movie: true };
}>;

// GET all mylist items for logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myList = await prisma.myList.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
    });

    // --- [FIX] Use our new, specific type instead of 'any' ---
    const myListMovies = myList.map((item: MyListWithMovie) => {
      const category = item.movie.url?.includes("/tv/") ? "tv" : "movie";
      return {
        ...item.movie,
        status: item.status,
        category: category,
      };
    });

    return NextResponse.json(myListMovies);
  } catch (error) {
    console.error("Error fetching mylist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const movieData = await req.json();
    const movie = await movieUpsert(movieData);
    const movieId = movie.id;
    const { status } = movieData;

    const myListItem = await prisma.myList.upsert({
      where: { userId_movieId: { userId: user.userId, movieId } },
      update: { status: status || "TOWATCH" },
      create: { userId: user.userId, movieId, status: status || "TOWATCH" },
      include: { movie: true },
    });

    return NextResponse.json(
      { ...myListItem.movie, status: myListItem.status },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to mylist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE remove movie from mylist
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

    await prisma.myList.delete({
      where: {
        userId_movieId: { userId: user.userId, movieId: parseInt(movieId, 10) },
      },
    });

    return new NextResponse(null, { status: 204 }); // Use 204 for successful deletion
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    console.error("Error removing from mylist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
