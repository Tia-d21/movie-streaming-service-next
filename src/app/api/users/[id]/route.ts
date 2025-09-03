import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch TMDB movie details
async function fetchMovieDetails(movieId: number) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);
    const userId = params.id;
    if (!user || (user.role !== 'ADMIN' && user.userId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        favorites: { select: { movieId: true, createdAt: true } },
        mylist: { select: { movieId: true, status: true, createdAt: true } },
        ratings: { select: { movieId: true, value: true, createdAt: true } },
        feedbacks: { select: { id: true, movieId: true, message: true, createdAt: true } },
        watchHistories: { select: { movieId: true, watchedAt: true } },
      },
    });

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fetch TMDB details for favorites, mylist, ratings, and watchHistories
    const favorites = await Promise.all(
      userData.favorites.map(async (fav) => {
        const movie = await fetchMovieDetails(fav.movieId);
        return movie ? { ...movie, addedAt: fav.createdAt } : { movieId: fav.movieId, addedAt: fav.createdAt };
      })
    );

    const mylist = await Promise.all(
      userData.mylist.map(async (item) => {
        const movie = await fetchMovieDetails(item.movieId);
        return movie ? { ...movie, status: item.status, addedAt: item.createdAt } : { movieId: item.movieId, status: item.status, addedAt: item.createdAt };
      })
    );

    const ratings = await Promise.all(
      userData.ratings.map(async (rating) => {
        const movie = await fetchMovieDetails(rating.movieId);
        return movie ? { ...movie, value: rating.value, ratedAt: rating.createdAt } : { movieId: rating.movieId, value: rating.value, ratedAt: rating.createdAt };
      })
    );

    const watchHistories = await Promise.all(
      userData.watchHistories.map(async (wh) => {
        const movie = await fetchMovieDetails(wh.movieId);
        return movie ? { ...movie, watchedAt: wh.watchedAt } : { movieId: wh.movieId, watchedAt: wh.watchedAt };
      })
    );

    return NextResponse.json({
      ...userData,
      favorites,
      mylist,
      ratings,
      watchHistories,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT and DELETE routes remain the same as your original code


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const loggedInUser = await authMiddleware(req);
    if (!loggedInUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (loggedInUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    const validRoles = ['USER', 'ADMIN'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error('Error updating user:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------- DELETE user ----------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'ADMIN' && user.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove related records first
    await prisma.rating.deleteMany({ where: { userId: params.id } });
    await prisma.favorite.deleteMany({ where: { userId: params.id } });
    await prisma.myList.deleteMany({ where: { userId: params.id } });
    await prisma.feedback.deleteMany({ where: { userId: params.id } });
    await prisma.watchHistory.deleteMany({ where: { userId: params.id } });

    const deletedUser = await prisma.user.delete({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
