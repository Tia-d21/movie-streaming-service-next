import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "middlewares/adminAuth";
import { prisma } from "lib/prisma";
import { Prisma } from "@prisma/client"; // --- [FIX] Import Prisma's types

// GET movie by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = Number(params.id);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        category: { select: { id: true, name: true } },
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
  { params }: { params: { id: string } }
) {
  try {
    // A more streamlined way to handle auth
    await adminAuth(req);

    const movieId = Number(params.id);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const body = await req.json();
    const { categoryId, title, description, genre, year, url, rating } = body;

    // --- [FIX] Use Prisma's generated type for the update payload ---
    const dataToUpdate: Prisma.MovieUpdateInput = {};

    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (genre) dataToUpdate.genre = genre;
    if (year) dataToUpdate.year = year;
    if (url) dataToUpdate.url = url;
    if (rating !== undefined) dataToUpdate.rating = rating;

    // --- [FIX] Validate categoryId and ensure it's a string ---
    if (categoryId) {
      if (typeof categoryId !== "string") {
        return NextResponse.json(
          { error: "categoryId must be a string" },
          { status: 400 }
        );
      }
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 }
        );
      }
      // Connect to the category relation
      dataToUpdate.category = {
        connect: { id: categoryId },
      };
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: dataToUpdate,
      include: {
        category: { select: { id: true, name: true } },
        favorites: { include: { user: { select: { id: true, name: true } } } },
        mylist: { include: { user: { select: { id: true, name: true } } } },
        ratings: { include: { user: { select: { id: true, name: true } } } },
        feedbacks: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(updatedMovie);
  } catch (error: unknown) {
    console.error("Error updating movie:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
      }
    }
    // Handle auth errors which might be thrown from adminAuth
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
  { params }: { params: { id: string } }
) {
  try {
    await adminAuth(req);

    const movieId = Number(params.id);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    await prisma.movie.delete({ where: { id: movieId } });

    return new NextResponse(null, { status: 204 }); // Return 204 No Content for successful deletions
  } catch (error: unknown) {
    console.error("Error deleting movie:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
