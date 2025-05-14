import { NextRequest, NextResponse } from 'next/server';
import { tokenProvider } from '@/actions/stream.actions'; // adjust the path if needed

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const token = await tokenProvider(userId);
    return NextResponse.json({ token });
  } catch (err) {
    console.error('Stream token API error:', err);
    return NextResponse.json({ error: 'Failed to generate Stream token' }, { status: 500 });
  }
}
