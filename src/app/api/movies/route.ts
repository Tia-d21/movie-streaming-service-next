import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dummy admin check middleware
const adminAuth = (req: NextRequest) => {
  // For now, simple placeholder
  const isAdmin = true; // later replace with real auth check
  if (!isAdmin) throw new Error("Not authorized");
};

// ===== POST: Create a new movie =====
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const { title, description, genre, year } = body;
    if (!title || !description || !genre || !year) {
      return NextResponse.json(
        { error: "All fields (title, description, genre, year) are required" },
        { status: 400 }
      );
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        genre,
        year: Number(year),
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 });
  }
}

// ===== GET: Fetch all movies =====
export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(movies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

// ===== PUT: Update movie (admin only) =====
export async function PUT(request: NextRequest) {
  try {
    adminAuth(request); // check if admin

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
    }

    const movie = await prisma.movie.update({
      where: { id: Number(id) },
      data: updates,
    });

    return NextResponse.json(movie);
  } catch (error: any) {
    console.error(error);
    const status = error.message === "Not authorized" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to update movie" }, { status });
  }
}

// ===== DELETE: Delete movie (admin only) =====
export async function DELETE(request: NextRequest) {
  try {
    adminAuth(request); // check if admin
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
    }

    await prisma.movie.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Movie deleted successfully" });
  } catch (error: any) {
    console.error(error);
    const status = error.message === "Not authorized" ? 403 : 500;
    return NextResponse.json({ error: error.message || "Failed to delete movie" }, { status });
  }
}
