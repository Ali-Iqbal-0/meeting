'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';

export default function MeetingPage() {
  const params = useParams(); // Get params dynamically
  const id = params?.id as string; // Extract the `id` param
  const [isSteupComplete, setisSteupComplete] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch meeting details if ID is not 'new'
  useEffect(() => {
    if (id !== 'new') {
      const fetchMeeting = async () => {
        try {
          const res = await fetch(`/${id}`);
          if (res.ok) {
            const data = await res.json();
            setMeeting(data);
          } else {
            setError('Failed to load meeting');
          }
        } catch (err) {
          setError('Something went wrong');
        }
      };
      fetchMeeting();
    }
  }, [id]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date }),
      });

      if (res.ok) {
        const newMeeting = await res.json();
        router.push(`/${newMeeting._id}`);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create meeting');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <main className="h-screen w-full">
    <StreamCall >
      <StreamTheme>
       {!isSteupComplete ?(
        <MeetingSetup setisSteupComplete={setisSteupComplete}/>
       ):(
        <MeetingRoom/>
       )}
      </StreamTheme>
    </StreamCall>
  </main>
  );
}
