import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper: fetch movie details from TMDB
async function fetchMovieDetails(movieId: number) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
    };
  } catch (err) {
    console.error('TMDB fetch error:', err);
    return null;
  }
}

// ---------------- GET watch history for a user ----------------
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    const userId = params.id;

    // Access control: self + admin
    if (!user || (user.role !== 'ADMIN' && user.userId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // UUID validation
    if (!userId || !/^[0-9a-fA-F-]{36}$/.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch watch history from Prisma
    const historyItems = await prisma.watchHistory.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { watchedAt: 'desc' },
    });

    // Fetch TMDB details for each movie
    const historyWithMovies = await Promise.all(
      historyItems.map(async (item) => {
        const movieDetails = await fetchMovieDetails(item.movieId);
        return {
          movieId: item.movieId,
          watchedAt: item.watchedAt,
          movieDetails: movieDetails || { id: item.movieId },
        };
      })
    );

    const total = await prisma.watchHistory.count({ where: { userId } });

    return NextResponse.json({
      history: historyWithMovies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching user watch history:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

