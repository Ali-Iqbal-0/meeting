import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { callId, userId, currentHostId, accepted } = await request.json();

    if (!callId || !userId || !currentHostId || typeof accepted !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify current user is the main host
    const currentUser = meeting.participants.find((p: any) => p.userId === currentHostId);
    if (!currentUser || currentUser.userId !== meeting.creatorId) {
      return NextResponse.json(
        { error: 'Only the main host can assign co-hosts' },
        { status: 403 }
      );
    }

    const participantIndex = meeting.participants.findIndex(
      (p: any) => p.userId === userId
    );

    if (participantIndex === -1) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    meeting.participants[participantIndex].isHost = accepted;
    meeting.markModified('participants');
    await meeting.save();

    return NextResponse.json({
      success: true,
      message: accepted 
        ? `Successfully made ${meeting.participants[participantIndex].name} a co-host`
        : `Removed co-host privileges from ${meeting.participants[participantIndex].name}`,
      participant: meeting.participants[participantIndex],
      updatedAt: meeting.updatedAt
    });
  } catch (error) {
    console.error('Error updating co-host status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}