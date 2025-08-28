import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

// GET all mylist items for logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const myList = await prisma.myList.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    const myListMovies = myList.map(item => ({ ...item.movie, status: item.status }));

    return NextResponse.json(myListMovies);
  } catch (error) {
    console.error('Error fetching mylist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add movie to mylist
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId, status } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId is required' }, { status: 400 });

    // Default status to TOWATCH if not provided
    const myListItem = await prisma.myList.upsert({
      where: { userId_movieId: { userId: user.userId, movieId } },
      update: { status: status || 'TOWATCH' },
      create: { userId: user.userId, movieId, status: status || 'TOWATCH' },
      include: { movie: true },
    });

    return NextResponse.json({ ...myListItem.movie, status: myListItem.status }, { status: 201 });
  } catch (error) {
    console.error('Error adding to mylist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE remove movie from mylist
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId is required' }, { status: 400 });

    await prisma.myList.delete({
      where: { userId_movieId: { userId: user.userId, movieId } },
    });

    return NextResponse.json({ message: 'Removed from My List' });
  } catch (error: any) {
    console.error('Error removing from mylist:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
