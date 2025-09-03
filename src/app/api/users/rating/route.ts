import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ratings = await prisma.rating.findMany({ where: { userId: user.userId } });
  return NextResponse.json(ratings);
}

export async function POST(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId, value } = await req.json();
  if (!movieId || typeof movieId !== 'number' || !value || typeof value !== 'number') {
    return NextResponse.json({ error: 'Invalid movieId or value' }, { status: 400 });
  }

  const existing = await prisma.rating.findFirst({ where: { userId: user.userId, movieId } });
  if (existing) {
    const updated = await prisma.rating.update({ where: { id: existing.id }, data: { value } });
    return NextResponse.json(updated);
  }

  const newRating = await prisma.rating.create({ data: { userId: user.userId, movieId, value } });
  return NextResponse.json(newRating, { status: 201 });
}
