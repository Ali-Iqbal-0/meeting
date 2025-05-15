import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, meetingLink } = await request.json();
    
    const { data, error } = await resend.emails.send({
      from: 'notifications@yourdomain.com',
      to: email,
      subject: 'Your meeting request has been approved',
      html: `
        <p>Your request to join the meeting has been approved!</p>
        <p>Click <a href="${meetingLink}">here</a> to join the meeting.</p>
      `
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending approval notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}