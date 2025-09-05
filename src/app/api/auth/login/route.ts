import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "lib/prisma";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- [FIX] Query for the user's name along with other details ---
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        name: true, // <<< ADD THIS LINE
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // It's good practice to include essential, non-sensitive info in the token payload
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      name: user.name, // Can be useful for some backend services
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "7d",
    });

    // --- [FIX] Return the full user object to the frontend ---
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name, // <<< ADD THIS LINE
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong during login" },
      { status: 500 }
    );
  }
}
