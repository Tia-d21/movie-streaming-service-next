import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middlewares/auth';
import { prisma } from '@/lib/prisma';

// GET all feedbacks of logged-in user
export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST feedback
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { movieId, message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.userId,
        movieId: movieId || null,
        message,
      },
      include: { movie: true },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE feedback
export async function DELETE(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}