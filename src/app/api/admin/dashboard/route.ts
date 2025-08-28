import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/middlewares/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await adminAuth(req); // Ensure only admin can access

    const totalUsers = await prisma.user.count();
    const totalMovies = await prisma.movie.count();
    const totalFavorites = await prisma.favorite.count();
    const totalMyList = await prisma.myList.count();
    const totalRatings = await prisma.rating.count();
    const totalFeedbacks = await prisma.feedback.count();

    return NextResponse.json({
      totalUsers,
      totalMovies,
      totalFavorites,
      totalMyList,
      totalRatings,
      totalFeedbacks,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
