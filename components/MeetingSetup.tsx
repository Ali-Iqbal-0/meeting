'use client';
import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react';

const MeetingSetup = ({setisSteupComplete}:{
  setisSteupComplete:(value:boolean)=>void}) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const call = useCall(); // Correct ussage of the hook
  const [isCameraReady, setIsCameraReady] = useState(false);
  useEffect(() => {
    if (!call) return; // Guard clause for when call is undefined

    const setupMedia = async () => {
      try {
        if (isMicCamToggledOn) {
          await call.camera.disable();
          await call.microphone.disable();
          setIsCameraReady(false);
        } else {
          await call.camera.enable();
          await call.microphone.enable();
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error('Error setting up media devices:', err);
        setIsCameraReady(false);
      }
    };

    setupMedia();
  }, [isMicCamToggledOn, call]);// Simplified dependency array

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
      <h1 className='text-2xl font-bold'>Meeting Setup</h1>
      {call && isCameraReady && <VideoPreview />}
      <div className='flex gap-3'>
        <button
          onClick={() => setIsMicCamToggledOn((prev) => !prev)}
          className='rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          {isMicCamToggledOn ? 'Enable Mic/Cam' : 'Disable Mic/Cam'}
        </button>
      </div>
      <DeviceSettings/>
      <button className='rounded-md bg-green-400 px-4 py-2.5' onClick={()=>{
        call?.join();
        setisSteupComplete(true);
      }} >
Join Meeting
      </button>
    </div>
  );
};

export default MeetingSetup;