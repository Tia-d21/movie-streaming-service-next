import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history = await prisma.watchHistory.create({
      data: {
        userId: body.userId,
        movieId: body.movieId,
      },
    });
    return NextResponse.json(history, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add watch history' }, { status: 500 });
  }
}
