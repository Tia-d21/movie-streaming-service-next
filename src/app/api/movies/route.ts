import { NextRequest, NextResponse } from 'next/server';
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
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error: any) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
