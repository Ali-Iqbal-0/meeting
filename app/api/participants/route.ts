import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';

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

    const meeting = await Meeting.findOne({ callId });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    const participants = meeting.participants.map((p: any) => ({
      userId: p.userId,
      name: p.name,
      email: p.email,
      isHost: p.isHost,
      status: p.status,
      isCreator: p.userId === meeting.creatorId
    }));

    return NextResponse.json({
      participants,
      updatedAt: meeting.updatedAt
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}