'use client';
import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react';

const MeetingSetup = ({ setisSteupComplete }: { setisSteupComplete: (value: boolean) => void }) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const call = useCall();

  useEffect(() => {
    if (!call) {
      console.warn('Call object is not initialized yet');
      return;
    }

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
        alert('Failed to set up camera/microphone. Please check permissions.');
        setIsCameraReady(false);
      }
    };

    setupMedia();
  }, [isMicCamToggledOn, call]);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error('Permission denied for media devices:', err);
        alert('Please grant camera and microphone permissions to join the meeting.');
      }
    };
    checkPermissions();
  }, []);

  if (!call) {
    return <div>Loading call setup...</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold">Meeting Setup</h1>
      {isCameraReady && <VideoPreview />}
      <div className="flex gap-3">
        <button
          onClick={() => setIsMicCamToggledOn((prev) => !prev)}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {isMicCamToggledOn ? 'Enable Mic/Cam' : 'Disable Mic/Cam'}
        </button>
      </div>
      <DeviceSettings />
      <button
        className="rounded-md bg-green-400 px-4 py-2.5"
        disabled={isMicCamToggledOn ? false : !isCameraReady}
        onClick={async () => {
          try {
            await call.join();
            setisSteupComplete(true);
          } catch (error) {
            console.error('Error joining the call:', error);
            alert('Failed to join the meeting. Please try again.');
          }
        }}
      >
        Join Meeting
      </button>
    </div>
  );
};

export default MeetingSetup;