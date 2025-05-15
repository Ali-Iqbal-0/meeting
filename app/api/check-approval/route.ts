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

    const meeting = await Meeting.findOne({ callId })
      .select('participants')
      .lean() as { participants: { userId: string; status: string }[] } | null;

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const participant = meeting.participants.find(
      (p: any) => p.userId === userId
    );

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      status: participant.status,
      message: participant.status === 'approved' 
        ? 'You have been approved to join the meeting' 
        : participant.status === 'rejected'
          ? 'Your request has been rejected'
          : 'Your request is still pending'
    });
  } catch (error) {
    console.error('Error checking approval status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}