import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Use the authentication middleware to verify the token and get the user's ID and role.
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user's full profile from the database using the ID from the token.
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      // 3. Select ONLY the fields that are safe to send to the frontend.
      //    NEVER include the password hash.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userProfile) {
      // This can happen if the user was deleted but the token hasn't expired yet.
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return the user's profile data.
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
