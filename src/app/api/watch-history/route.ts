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
    return res.json();
  } catch (err) {
    console.error('TMDB fetch error:', err);
    return null;
  }
}

// ---------------- GET watch history ----------------
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch watch history from DB
    const history = await prisma.watchHistory.findMany({
      where: { userId: user.userId },
      skip,
      take: limit,
      orderBy: { watchedAt: 'desc' },
    });

    // Enrich each watched movie with TMDB data
    const historyWithMovies = await Promise.all(
      history.map(async (item) => {
        const movieDetails = await fetchMovieDetails(item.movieId);
        return movieDetails
          ? { ...movieDetails, watchedAt: item.watchedAt }
          : { movieId: item.movieId, watchedAt: item.watchedAt };
      })
    );

    const total = await prisma.watchHistory.count({ where: { userId: user.userId } });

    return NextResponse.json({
      history: historyWithMovies,
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

// ---------------- POST add/update watch history ----------------
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId || typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Movie ID is required and must be a number' }, { status: 400 });
    }

    // Check if watch history exists
    const existing = await prisma.watchHistory.findFirst({
      where: { userId: user.userId, movieId },
    });

    let historyEntry;

    if (existing) {
      // Update timestamp if already watched
      historyEntry = await prisma.watchHistory.update({
        where: { id: existing.id },
        data: { watchedAt: new Date() },
      });
    } else {
      // Add new watch history entry
      historyEntry = await prisma.watchHistory.create({
        data: { userId: user.userId, movieId, watchedAt: new Date() },
      });
    }

    // Automatically update MyList status to COMPLETED
    await prisma.myList.updateMany({
      where: { userId: user.userId, movieId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({ message: 'Movie watched and MyList updated', historyEntry }, { status: 201 });
  } catch (err) {
    console.error('Error adding to watch history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------- DELETE watch history ----------------
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId } = await req.json();
    if (!movieId || typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Movie ID is required and must be a number' }, { status: 400 });
    }

    await prisma.watchHistory.deleteMany({
      where: { userId: user.userId, movieId },
    });

    return NextResponse.json({ message: 'Removed from watch history' });
  } catch (err) {
    console.error('Error deleting watch history:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
