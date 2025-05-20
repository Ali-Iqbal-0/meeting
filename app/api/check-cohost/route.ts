import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const userId = searchParams.get('userId');
    
    if (!callId || !userId) {
      return NextResponse.json(
        { error: 'Call ID and User ID are required' },
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

    const participant = meeting.participants.find(
      (p: any) => p.userId === userId
    );

    return NextResponse.json({ 
      isCoHost: participant?.isHost && participant.userId !== meeting.creatorId,
      isMainHost: participant?.userId === meeting.creatorId
    });
  } catch (error) {
    console.error('Error checking co-host status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}