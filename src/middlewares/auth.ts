import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "lib/prisma";

// Use the secret from your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthUser {
  userId: string;
  role: string;
}

export async function authMiddleware(
  req: NextRequest
): Promise<AuthUser | null> {
  // Ensure we have a secret to work with
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in .env.local");
    return null;
  }

  try {
    const authHeader = req.headers.get("authorization");

    // Check if the header exists and is in the correct "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Extract the token part
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Optional but recommended: Check if the user from the token still exists in the database.
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }, // Only select what's needed
    });

    if (!user) {
      // The user associated with this token has been deleted.
      return null;
    }

    // Return the verified user payload
    return { userId: user.id, role: user.role };
  } catch (err: unknown) {
    // This block will catch errors like "invalid signature" or "jwt expired"
    console.error("Authentication error:", (err as Error).message);
    return null;
  }
}
