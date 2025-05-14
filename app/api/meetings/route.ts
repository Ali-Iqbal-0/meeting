import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

const JWT_SECRET = 'ugdeugdeud77556'; // Replace with env variable

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const { callId, title, date, creatorId, meetingLink,meetingType } = await request.json();

    if (!callId || !title || !date || !creatorId || !meetingLink || !meetingType) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (creatorId !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized: Creator ID mismatch' }, { status: 403 });
    }

    const db = await getDb();
    const meeting = {
      callId,
      title,
      date: new Date(date),
      creatorId,
      meetingLink,
      createdAt: new Date(),
meetingType,
    };

    const result = await db.collection('meetings').insertOne(meeting);
    return NextResponse.json({ _id: result.insertedId, ...meeting }, { status: 201 });
  } catch (error) {
    console.error('Meetings API error:', error);
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}