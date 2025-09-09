import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admin or the user themselves can update
    if (user.role !== "ADMIN" && user.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, currentPassword, newPassword, password } = body;

    // Handle password change (requires current password for users, not for admins)
    if (currentPassword && newPassword) {
      return handlePasswordChange(params.id, currentPassword, newPassword, user);
    }

    // Handle admin password reset (no current password required)
    if (password && user.role === "ADMIN") {
      return handleAdminPasswordReset(params.id, password);
    }

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(request);
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

// Helper function for password change (requires current password)
async function handlePasswordChange(
  userId: string, 
  currentPassword: string, 
  newPassword: string,
  authUser: { role: string; userId: string } // ✅ Replace 'any' with proper type
) {
  try {
    // Users can only change their own password
    if (authUser.role !== "ADMIN" && authUser.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new passwords are required." }, 
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" }, 
        { status: 400 }
      );
    }

    // Validate new password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { password: hashedPassword } 
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function for admin password reset (no current password required)
async function handleAdminPasswordReset(userId: string, newPassword: string) {
  try {
    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { password: hashedPassword } 
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}