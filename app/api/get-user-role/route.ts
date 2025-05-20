import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';

export const dynamic = 'force-dynamic';

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

    const participant = meeting.participants.find((p: any) => p.userId === userId);
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    const isCreator = participant.userId === meeting.creatorId;
    const isCoHost = participant.isHost;

    return NextResponse.json({ 
      role: isCreator ? 'host' : isCoHost ? 'cohost' : 'participant',
      permissions: {
        canManageParticipants: isCreator || isCoHost,
        canEndCall: isCreator || isCoHost,
        canViewStats: isCreator || isCoHost,
        canModifyHosts: isCreator // Only main host can modify host status
      },
      dbData: {
        isHost: participant.isHost,
        isCreator,
        updatedAt: meeting.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}