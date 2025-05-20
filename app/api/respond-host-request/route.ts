import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';
import Notification from '@/lib/models/notification.model';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { notificationId, response, userId, callId } = await request.json();

    if (!notificationId || !userId || typeof response !== 'boolean' || !callId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.receiverId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (notification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request already processed' },
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

    if (response) {
      // If accepted, make the user a host
      const participantIndex = meeting.participants.findIndex(
        (p: any) => p.userId === userId
      );

      if (participantIndex === -1) {
        return NextResponse.json(
          { error: 'Participant not found in meeting' },
          { status: 404 }
        );
      }

      meeting.participants[participantIndex].isHost = true;
      meeting.markModified('participants');
      await meeting.save();
    }

    // Update notification status
    notification.status = response ? 'accepted' : 'rejected';
    notification.respondedAt = new Date();
    await notification.save();

    return NextResponse.json({
      success: true,
      message: response 
        ? 'You have accepted the host role'
        : 'You have declined the host role',
      isHost: response,
      callId,
    });
  } catch (error) {
    console.error('Error responding to host request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}