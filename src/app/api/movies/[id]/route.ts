import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/middlewares/adminAuth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET movie by id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const movieId = Number(id);
    
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        favorites: { include: { user: { select: { id: true, name: true } } } },
        mylist: { include: { user: { select: { id: true, name: true } } } },
        ratings: { include: { user: { select: { id: true, name: true } } } },
        feedbacks: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch (error: unknown) {
    console.error("Error fetching movie:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update movie (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminAuth(req);

    const movieId = Number(id);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, genre, year, url, rating } = body;

    const dataToUpdate: Prisma.MovieUpdateInput = {};

    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (genre) dataToUpdate.genre = genre;
    if (year) dataToUpdate.year = year;
    if (url) dataToUpdate.url = url;
    if (rating !== undefined) dataToUpdate.rating = rating;

    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: dataToUpdate,
      include: {
        favorites: { include: { user: { select: { id: true, name: true } } } },
        mylist: { include: { user: { select: { id: true, name: true } } } },
        ratings: { include: { user: { select: { id: true, name: true } } } },
        feedbacks: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(updatedMovie);
  } catch (error: unknown) {
    console.error("Error updating movie:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
      }
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE movie (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminAuth(req);

    const movieId = Number(id);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    await prisma.movie.delete({ where: { id: movieId } });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Error deleting movie:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
      }
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
