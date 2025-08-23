import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/middlewares/adminAuth';

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await adminAuth(req);

    const body = await req.json();
    const movie = await prisma.movie.create({
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        year: body.year,
        url: body.url,
=======
import { adminAuth } from '@/middlewares/adminAuth';
import { prisma } from '@/lib/prisma';

// GET all movies
export async function GET(req: NextRequest) {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json(movies);
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST create new movie (admin only)
export async function POST(req: NextRequest) {
  try {
    // Admin check with proper error handling
    const admin = await adminAuth(req).catch((err: any) =>
      NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
    );
    if ((admin as NextResponse)?.status === 401) return admin as NextResponse;

    const body = await req.json();
    const { title, description, genre, year, url, categoryId, rating } = body;

    // Validate required fields
    if (!title || !description || !year || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category if provided
    let validCategoryId: string | null = null;
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      validCategoryId = categoryId;
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        genre: genre || 'Unknown',
        year,
        url,
        rating: rating || null,
        categoryId: validCategoryId,
>>>>>>> backend/users-categories-watchhistory
      },
    });

    return NextResponse.json(movie, { status: 201 });
<<<<<<< HEAD
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unauthorized' }, { status: 401 });
  }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // Check if user is admin
  const isAdmin = await adminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const updatedMovie = await prisma.movie.update({
      where: { id: Number(params.id) },
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        year: body.year,
        url: body.url,
      },
    });
    return NextResponse.json(updatedMovie);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Check if user is admin
  const isAdmin = await adminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.movie.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
=======
  } catch (error: any) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
>>>>>>> backend/users-categories-watchhistory
