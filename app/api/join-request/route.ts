import { NextResponse } from 'next/server';
import Meeting from '@/lib/models/meeting.model';
import { connectToDatabase } from '@/lib/mongoose';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { callId, name, email, userId, status } = await req.json();

    const updatedMeeting = await Meeting.findOneAndUpdate(
      { callId },
      {
        $push: {
          participants: {
            userId,
            name,
            email,
            status,
          },
        },
      },
      { new: true }
    );

    if (!updatedMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
