import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

<<<<<<< HEAD
=======
  
    const validRoles = ['USER', 'ADMIN'];
    const role = validRoles.includes(body.role) ? body.role : 'USER';

>>>>>>> backend/users-categories-watchhistory
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
<<<<<<< HEAD
        role: body.role || 'USER',
      },
    }) as { id: string; email: string };

    return NextResponse.json(
      { id: user.id, email: user.email },
=======
        role: role,
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
>>>>>>> backend/users-categories-watchhistory
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'the user already exists' }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> backend/users-categories-watchhistory
