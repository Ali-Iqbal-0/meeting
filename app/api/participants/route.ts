import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const participants = await db.collection('Participants').find({}).toArray();
    return NextResponse.json(participants, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}