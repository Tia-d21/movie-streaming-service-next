<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function adminAuth(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optionally attach userId to request if needed
    (req as any).userId = decoded.userId;

    return true; // admin verified
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
=======
import { NextRequest } from 'next/server';
import { authMiddleware } from './auth';

export async function adminAuth(req: NextRequest) {
  const user = await authMiddleware(req);

  if (!user) {
    const error: any = new Error('Unauthorized: No valid token');
    error.status = 401;
    throw error;
  }

  if (user.role !== 'ADMIN') {
    const error: any = new Error('Unauthorized: Admin only');
    error.status = 401;
    throw error;
  }

  return user;
>>>>>>> backend/users-categories-watchhistory
}
