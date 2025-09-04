import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";

// GETs all feedback (comments) for a specific movie ID.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieId = parseInt(params.id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid Movie ID" }, { status: 400 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { movieId: movieId },
      orderBy: { createdAt: 'desc' },
      // Include the user's name with each comment
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(feedbacks);

  } catch (error) {
    console.error(`Error fetching feedback for movie ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}