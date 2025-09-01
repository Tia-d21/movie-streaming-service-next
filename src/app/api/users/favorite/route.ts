import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch TMDB movie details
async function fetchMovieDetails(movieId: number) {
  const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
  if (!res.ok) return null;
  return res.json();
}

// GET all favorites
export async function GET(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }
  });

  const favoriteMovies = await Promise.all(
    favorites.map(async (fav) => {
      const movie = await fetchMovieDetails(fav.movieId);
      return movie ? { ...movie, addedAt: fav.createdAt } : { movieId: fav.movieId, addedAt: fav.createdAt };
    })
  );

  return NextResponse.json(favoriteMovies);
}

// POST add a favorite
export async function POST(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId } = await req.json();
  if (!movieId || typeof movieId !== 'number') {
    return NextResponse.json({ error: 'movieId is required and must be a number' }, { status: 400 });
  }

  const existing = await prisma.favorite.findFirst({ where: { userId: user.userId, movieId } });
  if (existing) return NextResponse.json({ message: 'Already in favorites' });

  const favorite = await prisma.favorite.create({ data: { userId: user.userId, movieId } });
  const movie = await fetchMovieDetails(movieId);

  return NextResponse.json(movie ? { ...movie, addedAt: favorite.createdAt } : { movieId, addedAt: favorite.createdAt }, { status: 201 });
}

// DELETE remove a favorite
export async function DELETE(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId } = await req.json();
  if (!movieId || typeof movieId !== 'number') {
    return NextResponse.json({ error: 'movieId is required and must be a number' }, { status: 400 });
  }

  await prisma.favorite.deleteMany({ where: { userId: user.userId, movieId } });
  return NextResponse.json({ message: 'Removed from favorites' });
}
