import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/middlewares/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { movies: true } } },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    
    await adminAuth(req);

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name: body.name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

  
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

  
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
