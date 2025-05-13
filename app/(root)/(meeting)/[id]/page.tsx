'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';

export default function MeetingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();

  // Mark as client-side after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !client) return; // Skip during SSR

    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/signin');
      return;
    }

    const initializeCall = async () => {
      try {
        const callInstance = client.call('default', id);
        await callInstance.get();
        setCall(callInstance);
      } catch (err) {
        console.error('Error initializing call:', err);
        setError('Failed to initialize call');
      }
    };

    if (id !== 'new') {
      const fetchMeeting = async () => {
      };
      fetchMeeting();
      initializeCall();
    }
  }, [id, client, isClient, router]);

  const [call, setCall] = useState<any>(null);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!call) {
    return <div>Loading...</div>;
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setisSteupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
}