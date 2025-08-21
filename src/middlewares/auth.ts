import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthUser {
  userId: string;
  role: string;
}

export async function authMiddleware(req: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    return decoded;
  } catch (error) {
    return null;
  }
}