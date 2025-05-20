'use client';
import { useCall } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React from 'react';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        if (call) {
          await call.endCall();
        } else {
          console.error('Call object is undefined');
        }
        router.push('/');
      }}
      className='bg-red-500 rounded-3xl cursor-pointer'
    >
      End Call for Everyone
    </button>
  );
};

export default EndCallButton;