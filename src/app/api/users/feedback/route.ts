import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

const TMDB_API_KEY = process.env.MDB_API_KEY;
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

// GET all feedbacks by logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, movieId: true, message: true, createdAt: true },
    });

    const feedbackWithMovies = await Promise.all(
      feedbacks.map(async (f) => {
        let movie = null;
        if (f.movieId) movie = await fetchMovieDetails(f.movieId);
        return { ...f, movie };
      })
    );

    return NextResponse.json(feedbackWithMovies);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add feedback
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const movieId = body.movieId ? Number(body.movieId) : null;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: 'Feedback message is required' }, { status: 400 });
    }
    if (movieId && isNaN(movieId)) {
      return NextResponse.json({ error: 'movieId must be a number if provided' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: { userId: user.userId, movieId, message },
    });

    let movie = null;
    if (movieId) movie = await fetchMovieDetails(movieId);

    return NextResponse.json({ ...feedback, movie }, { status: 201 });
  } catch (err) {
    console.error('Error creating feedback:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE remove feedback
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const feedbackId = body.feedbackId;
    if (!feedbackId) {
      return NextResponse.json({ error: 'feedbackId is required' }, { status: 400 });
    }

    const deleted = await prisma.feedback.deleteMany({
      where: { id: feedbackId, userId: user.userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feedback removed successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
