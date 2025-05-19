// app/api/make-cohost/route.ts
import { NextResponse } from 'next/server';
import Meeting from '@/lib/models/meeting.model';

export async function POST(request: Request) {
  try {
    const { callId, userId, currentHostId, accepted } = await request.json();

    // Validate request
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

    // Verify current user is main host
    const currentHost = meeting.participants.find((p: { userId: string; isHost: boolean }) =>
        p.userId === currentHostId && p.isHost
      );
      
    if (!currentHost) {
      return NextResponse.json(
        { error: 'Only main host can assign co-hosts' },
        { status: 403 }
      );
    }

    if (accepted) {
      // Update co-host status
      await Meeting.updateOne(
        { callId, "participants.userId": userId },
        { $set: { "participants.$.isCoHost": true } }
      );

      return NextResponse.json({
        success: true,
        message: `${userId} is now a co-host`
      });
    } else {
      // Remove co-host status if request was declined
      await Meeting.updateOne(
        { callId, "participants.userId": userId },
        { $set: { "participants.$.isCoHost": false } }
      );

      return NextResponse.json({
        success: true,
        message: 'Co-host request was declined'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}