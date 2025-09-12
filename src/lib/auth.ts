import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createUser, getUserByEmail } from './db/queries';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return null;
    }

    // In a real app, you'd fetch from database
    // For demo purposes, we'll use a simple approach
    const user = await getUserByEmail(userId);
    return user ? { ...user, name: user.name || undefined } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signIn(email: string): Promise<User> {
  let user = await getUserByEmail(email);
  
  if (!user) {
    user = await createUser(email);
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set('user-id', user.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { ...user, name: user.name || undefined };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('user-id');
}

export function requireAuth(handler: (req: NextRequest, user: User, context?: { params: { id: string } }) => Promise<Response>) {
  return async (req: NextRequest, context?: { params: { id: string } }) => {
    const user = await getCurrentUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(req, user, context);
  };
}
