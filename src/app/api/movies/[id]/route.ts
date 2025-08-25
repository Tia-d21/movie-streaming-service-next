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
  try {
    await adminAuth(req);

    const body = await req.json();
    const updated = await prisma.movie.update({ where: { id: Number(params.id) }, data: body });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await adminAuth(req);

    await prisma.movie.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: 'Movie deleted' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unauthorized' }, { status: 401 });
  }
}
