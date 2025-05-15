import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Meeting from '@/lib/models/meeting.model';
import { connectToDatabase } from '@/lib/mongoose'; // Ensure this connects Mongoose

const JWT_SECRET = process.env.JWT_SECRET || 'ugdeugdeud77556'; // Use env variable

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase(); // Connect to MongoDB via Mongoose
    const { id } = context.params;
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
    }

    // Allow access if the user is the creator or a participant
    const isParticipant = meeting.participants.some(
      (p: any) => p.userId === decoded.userId && p.status === 'approved'
    );
    if (meeting.creatorId !== decoded.userId && !isParticipant) {
      return NextResponse.json({ message: 'Unauthorized: Not a participant or creator' }, { status: 403 });
    }

    return NextResponse.json(meeting, { status: 200 });
  } catch (error) {
    console.error('Meeting fetch API error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}