import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "middlewares/adminAuth";
import { prisma } from "lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { movies: true } } },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await adminAuth(req);

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Category name required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name: body.name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating category:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string" &&
      (error as { message: string }).message.includes("Unauthorized")
    ) {
      return NextResponse.json(
        { error: (error as { message: string }).message },
        { status: 401 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
