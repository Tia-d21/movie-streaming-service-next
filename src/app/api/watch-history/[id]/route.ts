import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  try {
    const user = await authMiddleware(request);

    const userId = params.id;

    if (!user || (user.role !== 'ADMIN' && user.userId !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    if (!userId || !/^[0-9a-fA-F-]{36}$/.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { watchedAt: 'desc' },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            url: true,
            rating: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const total = await prisma.watchHistory.count({ where: { userId } });

    return NextResponse.json({
      history: watchHistory,
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