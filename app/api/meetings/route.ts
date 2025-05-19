import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Meeting from '@/lib/models/meeting.model';
import { connectToDatabase } from '@/lib/mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'ugdeugdeud77556'; // Use environment variable

// GET: Fetch all meetings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name?: string };
    const meetings = await Meeting.find({ creatorId: decoded.userId })
      .sort({ date: -1 }) // Sort by date, newest first
      .lean();

    return NextResponse.json(meetings, { status: 200 });
  } catch (error) {
    console.error('Meetings fetch API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new meeting
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = request.cookies.get('token')?.value; // Consistent token extraction
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name?: string };
    const { callId, title, date, creatorId, meetingLink, meetingType, isPersonalRoom } = await request.json();

    // Validate required fields
    if (!callId || !title || !date || !creatorId || !meetingLink || !meetingType) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Ensure the creatorId matches the authenticated user
    if (creatorId !== decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized: Creator ID mismatch' }, { status: 403 });
    }

    // Create the meeting with the creator as a participant with isHost: true
    const meeting = new Meeting({
      callId,
      title,
      date: new Date(date),
      creatorId,
      meetingLink,
      meetingType,
      isPersonalRoom: !!isPersonalRoom, // Use provided value or default to false
      requiresJoinRequest: !isPersonalRoom, // Default to true unless personal room
      participants: [
        {
          userId: decoded.userId,
          name: decoded.name || 'Creator', // Use name from token or fallback
          email: decoded.email, // Use email from token
          status: 'approved', // Creator is automatically approved
          isHost: true, // Creator is the main host
        },
      ],
      createdAt: new Date(),
    });

    const savedMeeting = await meeting.save();
    return NextResponse.json(savedMeeting, { status: 201 });
  } catch (error) {
    console.error('Meetings API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}