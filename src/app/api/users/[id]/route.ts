import { NextRequest, NextResponse } from 'next/server'; 
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'ADMIN' && user.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        favorites: { select: { movieId: true } },
        mylist: { select: { movieId: true, status: true } },
        ratings: { select: { movieId: true, value: true } },
        feedbacks: { select: { id: true, message: true } },
      },
    });

    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'ADMIN' && user.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (password && !passwordRegex.test(password)) {
      return NextResponse.json({
        error: 'Password must be 8-20 chars, uppercase, lowercase, number & special char',
      }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);
    if (role && user.role === 'ADMIN') dataToUpdate.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    if (error.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const id = params.id;

    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    
    if (user.role !== 'ADMIN' && user.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.rating.deleteMany({ where: { userId: id } });
    await prisma.favorite.deleteMany({ where: { userId: id } });
    await prisma.myList.deleteMany({ where: { userId: id } });
    await prisma.feedback.deleteMany({ where: { userId: id } });

    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
