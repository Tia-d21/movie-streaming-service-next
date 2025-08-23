import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthUser {
  userId: string;
  role: string;
}

export async function authMiddleware(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Ensure user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return null;

    return { userId: user.id, role: user.role };
  } catch (err: any) {
    console.error('Auth error:', err); // <-- log JWT/DB errors
    return null;
  }
}
