import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Meeting from '@/lib/models/meeting.model';


export async function POST(request: Request) {
    try {
      await connectToDatabase();
      
      const body = await request.json();
  
      const { callId, participantId, action } = body;
      if (!callId || !participantId || !action) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      const call = await Meeting.findOne({ callId });
      if (!call) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }
  
      console.log('Meeting found:', call);
  
      const participantIndex = call.participants.findIndex(
        (p: any) => p._id.toString() === participantId
      );
  
      console.log('Participant index:', participantIndex);
  
      if (participantIndex === -1) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
      }
  
      if (action === 'accept') {
        call.participants[participantIndex].status = 'approved';
      } else if (action === 'reject') {
        call.participants[participantIndex].status = 'rejected';
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
  
      await call.save();
      console.log('Call updated and saved.');
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error handling request:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  