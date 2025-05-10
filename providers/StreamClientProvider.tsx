'use client';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { ReactNode, useEffect, useState } from 'react';
import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const generateRandomId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: Generate a random string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const apiKey = 'hjqx8fuvvdw5';

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>();

  useEffect(() => {
    if (!apiKey) {
      throw new Error('Stream API key is missing. Please set NEXT_PUBLIC_STREAM_API_KEY in .env.local');
    }

    const initClient = async () => {
      try {
        // Generate a unique guest user ID
        const guestUserId = `guest_${generateRandomId()}`;
        
        const client = new StreamVideoClient({
          apiKey,
          user: {
            id: guestUserId,
            name: guestUserId, // Customize name if needed
            image: '/icons/person.png',
          },
          tokenProvider: () => tokenProvider(guestUserId), // Pass guestUserId to tokenProvider
        });

        setVideoClient(client);

        // Cleanup on unmount
        return () => {
          client.disconnectUser();
        };
      } catch (error) {
        console.error('Failed to initialize StreamVideoClient:', error);
      }
    };

    initClient();
  }, []);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;