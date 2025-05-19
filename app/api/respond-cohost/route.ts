// app/api/respond-cohost/route.ts
import { NextResponse } from 'next/server';
import Meeting from '@/lib/models/meeting.model';

export async function POST(request: Request) {
  try {
    const { callId, userId, accepted, requestId } = await request.json();

    const meeting = await Meeting.findOne({ callId });
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const participant = meeting.participants.find((p: any) => p.userId === userId);
    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (accepted) {
      participant.isHost = true;
      participant.pendingHostRequest = false;
      await meeting.save();
      
      return NextResponse.json({
        success: true,
        message: 'You are now a co-host with full privileges',
      });
    } else {
      participant.pendingHostRequest = false;
      await meeting.save();
      
      return NextResponse.json({
        success: true,
        message: 'You declined the co-host request',
      });
    }
  } catch (error) {
    console.error('Error responding to co-host request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}