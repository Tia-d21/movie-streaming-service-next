import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const [
      totalUsers,
      totalFavorites,
      totalMyList,
      totalRatings,
      totalFeedbacks
    ] = await Promise.all([
      prisma.user.count(),
      prisma.favorite.count(),
      prisma.myList.count(),
      prisma.rating.count(),
      prisma.feedback.count()
    ]);

    return NextResponse.json({
      totalUsers,
      totalFavorites,
      totalMyList,
      totalRatings,
      totalFeedbacks,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin dashboard:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}