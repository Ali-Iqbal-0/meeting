import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';
import Notification from '@/lib/models/notification.model';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { callId, targetUserId, requesterId } = await request.json();

    if (!callId || !targetUserId || !requesterId) {
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

    // Verify requester is the main host
    const requester = meeting.participants.find((p: any) => p.userId === requesterId);
    if (!requester || requester.userId !== meeting.creatorId) {
      return NextResponse.json(
        { error: 'Only the main host can send host requests' },
        { status: 403 }
      );
    }

    // Check if target user is already a host
    const targetUser = meeting.participants.find((p: any) => p.userId === targetUserId);
    if (targetUser?.isHost) {
      return NextResponse.json(
        { error: 'User is already a host' },
        { status: 400 }
      );
    }

    // Create a notification for the target user
    const notification = new Notification({
      type: 'host_request',
      meetingId: meeting._id,
      senderId: requesterId,
      receiverId: targetUserId,
      status: 'pending',
      createdAt: new Date(),
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      message: `Host request sent to user`,
      notificationId: notification._id,
    });
  } catch (error) {
    console.error('Error sending host request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}