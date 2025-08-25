import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/middlewares/adminAuth';
import { prisma } from '@/lib/prisma';


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id }, 
      include: {
        movies: {
          select: { id: true, title: true, description: true, rating: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { movies: true } },
      },
    });

    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await adminAuth(req);

    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Category name required' }, { status: 400 });

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { name: body.name },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2002') return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await adminAuth(req);

    
    const count = await prisma.movie.count({ where: { categoryId: params.id } });
    if (count > 0) return NextResponse.json({ error: 'Cannot delete category with movies' }, { status: 400 });

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
