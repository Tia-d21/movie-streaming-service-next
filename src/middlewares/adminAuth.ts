import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function adminAuth(req: NextRequest) {
  try {
    // Example: get token from headers
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify token and get user ID (using your JWT or NextAuth session logic)
    const userId = token; // Replace this with real verification

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If admin, continue
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
