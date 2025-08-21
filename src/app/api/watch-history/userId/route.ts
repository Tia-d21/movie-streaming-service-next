
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await authMiddleware(request);
    
    if (!user || (user.role !== 'ADMIN' && user.userId !== params.userId)) {
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
      where: { userId: params.userId },
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
      where: { userId: params.userId },
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
    console.error('Error fetching user watch history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}