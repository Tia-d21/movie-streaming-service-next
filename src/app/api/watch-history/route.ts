import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const history = await prisma.watchHistory.findMany({
      where: { userId: user.userId },
      skip,
      take: limit,
      orderBy: { watchedAt: 'desc' },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            url: true,
            rating: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const total = await prisma.watchHistory.count({ where: { userId: user.userId } });

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching watch history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId || typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Movie ID is required and must be a number' }, { status: 400 });
    }

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });

    const existing = await prisma.watchHistory.findFirst({
      where: { userId: user.userId, movieId },
    });

    if (existing) {
      const updated = await prisma.watchHistory.update({
        where: { id: existing.id },
        data: { watchedAt: new Date() },
        include: { movie: { select: { id: true, title: true, url: true, rating: true, category: { select: { id: true, name: true } } } } },
      });
      return NextResponse.json(updated);
    }

    const newEntry = await prisma.watchHistory.create({
      data: { userId: user.userId, movieId, watchedAt: new Date() },
      include: { movie: { select: { id: true, title: true, url: true, rating: true, category: { select: { id: true, name: true } } } } },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err) {
    console.error('Error adding to watch history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}