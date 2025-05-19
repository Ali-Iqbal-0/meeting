import { NextResponse } from 'next/server';
import Meeting from '@/lib/models/meeting.model';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
  }

  try {
    const meeting = await Meeting.findOne({ callId }).select('participants creatorId');
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      participants: meeting.participants,
      creatorId: meeting.creatorId 
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}