import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, meetingLink, title, date, time } = await request.json();

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ch23799@gmail.com',
        pass: 'prlg tbrs bnsk gljy',
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Meeting Invite: ${title}`,
      html: `
        <h2>You're Invited to a Meeting</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Join Meeting:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Invite sent successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}