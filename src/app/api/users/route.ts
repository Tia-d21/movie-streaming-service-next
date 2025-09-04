import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "lib/prisma";
import { adminAuth } from "middlewares/adminAuth";
import { Role, Prisma } from "@prisma/client";

// --- GET: fetch all users ---
export async function GET(req: NextRequest) {
  try {
    await adminAuth(req); // only admin can fetch all users

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        favorites: { select: { movieId: true } },
        mylist: { select: { movieId: true, status: true } },
        ratings: { select: { movieId: true, value: true } },
        feedbacks: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

// --- POST: create new user ---
export async function POST(req: NextRequest) {
  try {
    await adminAuth(req); // only admin can create users

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles: Role[] = ["USER", "ADMIN"];
    const userRole = validRoles.includes(role) ? role : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- PUT: update user ---
export async function PUT(req: NextRequest) {
  try {
    const userAdmin = await adminAuth(req); // only admin
    const body = await req.json();
    const { id, name, email, password, role } = body;

    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);
    if (role && ["USER", "ADMIN"].includes(role)) dataToUpdate.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// --- DELETE: delete user ---
export async function DELETE(req: NextRequest) {
  try {
    const userAdmin = await adminAuth(req); // only admin
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ message: "User deleted", user: deletedUser });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
