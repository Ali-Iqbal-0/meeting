'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';
import Loader from '@/components/Loader';

export default function MeetingPage() {
  const params = useParams();
  const id = params?.id as string;
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !client) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/signin');
      return;
    }

    const initializeCall = async () => {
      try {
        const callInstance = client.call('default', id);
        await callInstance.get();
        
        const customData = callInstance.state.custom;
        const isHost = customData?.creatorId === userId;
        
        if (!isHost && !customData?.acceptedParticipants?.includes(userId)) {
          // Request to join if not host or approved participant
          await callInstance.update({
            custom: {
              ...customData,
              pendingParticipants: [...(customData.pendingParticipants || []), userId],
            },
          });
          
          // Show waiting message
          setError('Waiting for host approval...');
          return;
        }

        setCall(callInstance);
      } catch (err) {
        console.error('Error initializing call:', err);
        setError('Failed to join meeting. It may have ended or you may not have permission.');
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [id, client, isClient, router]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <p className="text-xl">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!call) {
    return <Loader />;
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