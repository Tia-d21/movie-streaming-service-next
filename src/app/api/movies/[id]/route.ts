import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/middlewares/adminAuth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movie = await prisma.movie.findUnique({ where: { id: Number(params.id) } });
    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await adminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await prisma.movie.update({
      where: { id: Number(params.id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await adminAuth(req);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.movie.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: 'Movie deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
