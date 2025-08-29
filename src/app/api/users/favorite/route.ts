import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

// GET all favorites of logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    // Map only the movie details to send to frontend
    const favoriteMovies = favorites.map(fav => ({
      id: fav.movie.id,
      title: fav.movie.title,
      description: fav.movie.description,
      year: fav.movie.year,
      url: fav.movie.url,
      rating: fav.movie.rating,
      categoryId: fav.movie.categoryId,
      createdAt: fav.movie.createdAt,
    }));

    return NextResponse.json(favoriteMovies);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add a movie to favorites
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId is required' }, { status: 400 });

    const existing = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId: user.userId, movieId } },
    });
    if (existing) return NextResponse.json({ message: 'Already in favorites' });

    const favorite = await prisma.favorite.create({
      data: { userId: user.userId, movieId },
      include: { movie: true },
    });

    return NextResponse.json({
      id: favorite.movie.id,
      title: favorite.movie.title,
      description: favorite.movie.description,
      year: favorite.movie.year,
      url: favorite.movie.url,
      rating: favorite.movie.rating,
      categoryId: favorite.movie.categoryId,
      createdAt: favorite.movie.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE remove a movie from favorites
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId) return NextResponse.json({ error: 'movieId is required' }, { status: 400 });

    await prisma.favorite.delete({
      where: { userId_movieId: { userId: user.userId, movieId } },
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error: any) {
    console.error('Error deleting favorite:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
