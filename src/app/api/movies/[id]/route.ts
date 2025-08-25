import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/middlewares/adminAuth';
import { prisma } from '@/lib/prisma';

// GET movie by id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: Number(params.id) },
      include: { category: { select: { id: true, name: true } } },
    });

    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (error: any) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT update movie (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await adminAuth(req).catch((err: any) =>
      NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
    );
    if ((admin as NextResponse)?.status === 401) return admin as NextResponse;

    const body = await req.json();
    const { categoryId, title, description, genre, year, url, rating } = body;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (genre) dataToUpdate.genre = genre;
    if (year) dataToUpdate.year = year;
    if (url) dataToUpdate.url = url;
    if (rating !== undefined) dataToUpdate.rating = rating;

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      dataToUpdate.categoryId = categoryId;
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: Number(params.id) },
      data: dataToUpdate,
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updatedMovie);
  } catch (error: any) {
    console.error('Error updating movie:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE movie (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await adminAuth(req).catch((err: any) =>
      NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 })
    );
    if ((admin as NextResponse)?.status === 401) return admin as NextResponse;

    await prisma.movie.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ message: 'Movie deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting movie:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
