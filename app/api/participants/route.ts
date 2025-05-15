import { connectToDatabase } from '@/lib/mongoose';
import { NextResponse } from 'next/server';
import InviteParticipants from '@/lib/models/Participant';

export async function GET() {
  try {
    await connectToDatabase();
    const invitees = await InviteParticipants.find({});
    return NextResponse.json(invitees, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
