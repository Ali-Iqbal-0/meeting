import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = 'ugdeugdeud77556'; // Replace with env variable

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid meeting ID' }, { status: 400 });
    }

    const db = await getDb();
    const meeting = await db.collection('meetings').findOne({ _id: new ObjectId(id) });

    if (!meeting) {
      return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
    }

    // Allow access if the user is the creator or a participant (for simplicity, all authenticated users can access)
    if (meeting.creatorId !== decoded.userId) {
      // Optionally, add logic to check if the user is a participant
    }

    return NextResponse.json(meeting, { status: 200 });
  } catch (error) {
    console.error('Meeting fetch API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}