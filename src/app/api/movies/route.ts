import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/middlewares/adminAuth';

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // check admin role
  const isAdmin = await adminAuth(request);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const movie = await prisma.movie.create({
      data: {
        title: body.title,
        description: body.description,
        genre: body.genre,
        year: body.year,
        // movieUrl will be a cloud URL
        url: body.url,
      },
    });
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
