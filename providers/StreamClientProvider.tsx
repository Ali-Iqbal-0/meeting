'use client';

import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { ReactNode, useEffect, useState } from 'react';
import { tokenProvider } from '@/actions/stream.actions';
import Loader from '@/components/Loader';

const apiKey = 'hjqx8fuvvdw5';

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email') || 'Unknown User';

    if (!apiKey) {
      console.error('Stream API key is missing');
      return;
    }

    /*if (!userId) {
      console.error('No userId found in localStorage, redirecting to signin');
      window.location.href = '/signin';
      return;
    }*/

      if (!userId || !email) {
        console.log('No user info found, setting dummy values');
        const dummyUserId = '123';
        const dummyEmail = 'example@gmail.com';
    
        localStorage.setItem('userId', dummyUserId);
        localStorage.setItem('email', dummyEmail);
        localStorage.setItem('token', 'your_dummy_token_here');
    
        // Re-run the effect after setting dummy values
        window.location.reload();
        return;
      }

    const initClient = async () => {
      try {
        const client = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: email,
            image: '/icons/person.png',
          },
          tokenProvider: () => tokenProvider(userId),
        });

        setVideoClient(client);
        console.log('StreamVideoClient initialized for user:', userId);
      } catch (error) {
        console.error('Failed to initialize StreamVideoClient:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initClient();

    return () => {
      videoClient?.disconnectUser();
    };
  }, []);

  if (isLoading || !videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;