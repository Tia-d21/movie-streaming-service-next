import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId: user.userId },
      skip,
      take: limit,
      orderBy: { watchedAt: 'desc' },
      include: {
        movie: {
          include: {
            category: true,
          },
        },
      },
    });

    const total = await prisma.watchHistory.count({
      where: { userId: user.userId },
    });

    return NextResponse.json({
      history: watchHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieId } = body;
    
    if (!movieId || typeof movieId !== 'number') {
      return NextResponse.json(
        { error: 'Movie ID is required and must be a number' },
        { status: 400 }
      );
    }
    
    
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

   
    const existingEntry = await prisma.watchHistory.findFirst({
      where: {
        userId: user.userId,
        movieId: movieId,
      },
    });

    if (existingEntry) {
      
      const watchHistory = await prisma.watchHistory.update({
        where: { id: existingEntry.id },
        data: { watchedAt: new Date() },
        include: {
          movie: {
            include: {
              category: true,
            },
          },
        },
      });

      return NextResponse.json(watchHistory);
    }

    const watchHistory = await prisma.watchHistory.create({
      data: {
        userId: user.userId,
        movieId: movieId,
        watchedAt: new Date(),
      },
      include: {
        movie: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(watchHistory, { status: 201 });
  } catch (error) {
    console.error('Error adding to watch history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}