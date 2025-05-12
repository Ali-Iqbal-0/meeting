import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0) });
    console.log('Logout: Token cookie cleared');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}