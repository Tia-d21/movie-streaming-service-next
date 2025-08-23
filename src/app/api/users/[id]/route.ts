import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin can get any user, normal user can get only self
    if (user.role !== 'ADMIN' && user.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin can update any user, normal user can update only self
    if (user.role !== 'ADMIN' && user.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    // Only admin can update role
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
