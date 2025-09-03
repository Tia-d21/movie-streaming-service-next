import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const mylist = await prisma.myList.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(mylist);
}

export async function POST(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId, status } = await req.json();
  if (!movieId || typeof movieId !== 'number') return NextResponse.json({ error: 'Invalid movieId' }, { status: 400 });

  const existing = await prisma.myList.findFirst({ where: { userId: user.userId, movieId } });

  if (existing) {
    const updated = await prisma.myList.update({ where: { id: existing.id }, data: { status } });
    return NextResponse.json(updated);
  }

  const newItem = await prisma.myList.create({ data: { userId: user.userId, movieId, status } });
  return NextResponse.json(newItem, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId } = await req.json();
  if (!movieId || typeof movieId !== 'number') return NextResponse.json({ error: 'Invalid movieId' }, { status: 400 });

  await prisma.myList.deleteMany({ where: { userId: user.userId, movieId } });
  return NextResponse.json({ message: 'Removed from mylist' });
}
