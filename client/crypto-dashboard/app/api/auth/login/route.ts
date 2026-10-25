import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/src/lib/server/db';
import { User } from '@/src/lib/server/models';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 },
    );
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
    await connectToDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user._id.toString())
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(secret));

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login API failed:', error);
    return NextResponse.json({ message: 'Unable to log in' }, { status: 500 });
  }
}
