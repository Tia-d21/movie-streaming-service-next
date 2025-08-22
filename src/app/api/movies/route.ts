import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/middlewares/adminAuth';

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true }, // include category info
    });
    return NextResponse.json(movies);
  } catch (error) {
    console.error(error);
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
        rating: body.rating ?? null, // optional
        categoryId: body.categoryId ?? null, // optional
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message || 'Unauthorized' }, { status: 401 });
  }
}
