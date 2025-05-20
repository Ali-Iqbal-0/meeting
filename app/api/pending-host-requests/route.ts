import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Notification from '@/lib/models/notification.model';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const callId = searchParams.get('callId');

    if (!userId || !callId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find the most recent pending host request for this user and meeting
    const notification = await Notification.findOne({
      receiverId: userId,
      type: 'host_request',
      status: 'pending',
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      notification,
    });
  } catch (error) {
    console.error('Error checking for host requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}