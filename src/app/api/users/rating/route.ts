import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

// GET all ratings of logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ratings = await prisma.rating.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add/update rating
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId, value } = await req.json();
    if (!movieId || !value || value < 1 || value > 5)
      return NextResponse.json({ error: 'MovieId and value (1-5) are required' }, { status: 400 });

    // Upsert rating (create or update)
    const rating = await prisma.rating.upsert({
      where: { userId_movieId: { userId: user.userId, movieId } },
      update: { value },
      create: { userId: user.userId, movieId, value },
      include: { movie: true },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error adding/updating rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE rating
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId is required' }, { status: 400 });

    await prisma.rating.delete({
      where: { userId_movieId: { userId: user.userId, movieId } },
    });

    return NextResponse.json({ message: 'Rating deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting rating:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}