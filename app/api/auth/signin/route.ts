import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Signin attempt:', { email });

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    const JWT_SECRET ='ugdeugdeud77556';
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const response = NextResponse.json(
      { message: 'Signed in successfully', userId: user._id.toString(), token },
      { status: 200 }
    );
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    console.log('Signin successful, token set:', email);
    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}