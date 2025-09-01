import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/middlewares/adminAuth';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchMovieDetails(movieId: number) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    await adminAuth(req); // only admin can fetch all users

    const users = await prisma.user.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map favorites, mylist, and ratings to include TMDB movie details
    const usersWithMovieDetails = await Promise.all(
      users.map(async (user) => {
        const favorites = await Promise.all(
          user.favorites.map(async (fav) => {
            const movie = await fetchMovieDetails(fav.movieId);
            return movie ? { ...movie, addedAt: fav.createdAt } : { movieId: fav.movieId, addedAt: fav.createdAt };
          })
        );

        const mylist = await Promise.all(
          user.mylist.map(async (item) => {
            const movie = await fetchMovieDetails(item.movieId);
            return movie
              ? { ...movie, status: item.status, addedAt: item.createdAt }
              : { movieId: item.movieId, status: item.status, addedAt: item.createdAt };
          })
        );

        const ratings = await Promise.all(
          user.ratings.map(async (rating) => {
            const movie = await fetchMovieDetails(rating.movieId);
            return movie
              ? { ...movie, value: rating.value, ratedAt: rating.createdAt }
              : { movieId: rating.movieId, value: rating.value, ratedAt: rating.createdAt };
          })
        );

        return {
          ...user,
          favorites,
          mylist,
          ratings,
          feedbacks: user.feedbacks, // feedback messages without TMDB details
        };
      })
    );

    return NextResponse.json(usersWithMovieDetails);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = ['USER', 'ADMIN'];
    const userRole = validRoles.includes(role) ? role : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002')
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
