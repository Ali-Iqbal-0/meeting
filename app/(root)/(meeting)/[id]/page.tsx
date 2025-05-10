'use client';
import React, { useState } from 'react';
import {
  StreamCall,
  StreamTheme,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css'; // Import Stream.io styles
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';
import { useGetCallById } from '@/hooks/useGetCallById';
import Loader from '@/components/Loader';

const Meeting = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const user = { id: 'Ali' }; 
const [isSteupComplete, setisSteupComplete] = useState(false);
const {call ,isCallLoading} =useGetCallById(id);

if( isCallLoading) return <Loader/>
  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
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
};

export default Meeting;