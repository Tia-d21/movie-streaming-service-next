import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "middlewares/auth";
import { prisma } from "lib/prisma";
import bcrypt from "bcryptjs";

// --- [FIX] Import Prisma types for stronger type safety ---
import { Role, Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {  
  try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Admins can view any profile, users can only view their own.
    if (user.role !== "ADMIN" && user.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    if (!userData)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {     try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admin or the user themselves can update (admin can update everything)
    if (user.role !== "ADMIN" && user.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    const dataToUpdate: Prisma.UserUpdateInput = {};

    // Update name
    if (name) dataToUpdate.name = name;

    // Update email with validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      dataToUpdate.email = email;
    }

    // Update password with hashing
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return NextResponse.json(
          { error: "Password does not meet complexity requirements" },
          { status: 400 }
        );
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Update role only if the current user is admin
    if (role && user.role === "ADMIN") {
      const normalizedRole = role.toUpperCase();
      if (Object.values(Role).includes(normalizedRole as Role)) {
        dataToUpdate.role = normalizedRole as Role;
      } else {
        return NextResponse.json(
          { error: "Invalid role specified" },
          { status: 400 }
        );
      }
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {     try {
    const user = await authMiddleware(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "ADMIN" && user.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      message: "User and all associated data deleted successfully",
      user: deletedUser,
    });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
