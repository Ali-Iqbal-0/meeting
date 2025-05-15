import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';

interface Participant {
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  _id?: any;
}

interface MeetingType {
  participants: Participant[];
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }

    const meeting = await Meeting.findOne({ callId })
      .select('participants')
      .lean<MeetingType>();

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const pendingParticipants = meeting.participants
      .filter((p) => p.status === 'pending')
      .map((p) => ({
        userId: p.userId,
        name: p.name,
        email: p.email,
        _id: p._id?.toString(),
      }));

    return NextResponse.json({ participants: pendingParticipants });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
