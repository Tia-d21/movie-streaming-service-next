import { NextRequest, NextResponse } from "next/server";
import { prisma } from "lib/prisma";
import bcrypt from "bcryptjs";
import { authMiddleware } from "middlewares/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await authMiddleware(req);
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (authUser.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new passwords are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, password: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
