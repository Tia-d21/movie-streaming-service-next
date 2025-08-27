import { NextRequest } from 'next/server';
import { authMiddleware } from './auth';

export async function adminAuth(req: NextRequest) {
  const user = await authMiddleware(req);

  if (!user) {
    const error: any = new Error('Unauthorized: No valid token');
    error.status = 401;
    throw error;
  }

  if (user.role !== 'ADMIN') {
    const error: any = new Error('Unauthorized: Admin only');
    error.status = 401;
    throw error;
  }

  return user;
}

