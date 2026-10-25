import 'server-only';
import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthenticatedUser | NextResponse> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!token) {
    return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured.');
    return NextResponse.json(
      { message: 'Authentication is not configured' },
      { status: 500 },
    );
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (typeof payload.id !== 'string' || typeof payload.email !== 'string') {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    return { id: payload.id, email: payload.email };
  } catch {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}

export function isAuthError(
  result: AuthenticatedUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
