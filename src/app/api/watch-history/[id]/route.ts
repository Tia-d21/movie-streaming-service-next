import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from 'middlewares/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // [id] param from folder
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

    // Fetch watch history
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
  } catch (error: unknown) {
    console.error('Error fetching user watch history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}