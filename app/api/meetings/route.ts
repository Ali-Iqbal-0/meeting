import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const JWT_SECRET ='ugdeugdeud77556';
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    console.log('Token verified in API:', decoded.email); // Debug log

    const { callId, title, date, creatorId, meetingLink } = await request.json();
    if (!title || !date) {
      return NextResponse.json({ message: 'Title and date are required' }, { status: 400 });
    }

    const db = await getDb();
    const meeting = {
      title,
      date: new Date(date),
      userId: decoded.userId,
      createdAt: new Date(),
      meetingLink:meetingLink,
    };

    const result = await db.collection('meetings').insertOne(meeting);

    return NextResponse.json({ _id: result.insertedId, ...meeting }, { status: 201 });
  } catch (error) {
    console.error('Meetings API error:', error); // Debug log
    return NextResponse.json({ message: 'Internal server error', error: (error as Error).message }, { status: 500 });
  }
}