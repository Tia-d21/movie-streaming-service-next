import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function adminAuth(req: NextRequest): Promise<void> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('Unauthorized');

  const userId = token; // Replace with JWT decode logic in production
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.role !== 'ADMIN') throw new Error('Unauthorized');
}
