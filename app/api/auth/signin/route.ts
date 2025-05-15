import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/mongoose';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const JWT_SECRET = 'ugdeugdeud77556';
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}
