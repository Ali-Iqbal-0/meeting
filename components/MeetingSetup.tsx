'use client';

import { DeviceSettings, useCall, VideoPreview, useCallStateHooks } from '@stream-io/video-react-sdk';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const MeetingSetup = ({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) => {
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinRequest, setJoinRequest] = useState({
    name: '',
    email: ''
  });
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);
  
  const call = useCall();
  const { useCallCallingState, useCallCustomData } = useCallStateHooks();
  const callingState = useCallCallingState();
  const customData = useCallCustomData();
  const router = useRouter();

  // Check if user exists in localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const userName = typeof window !== 'undefined' ? localStorage.getItem('name') : null;

  const isHost = useMemo(() => {
    if (!userId || !customData?.creatorId) return false;
    return customData.creatorId === userId;
  }, [customData, userId]);

  useEffect(() => {
    if (!call) {
      console.warn('Call object is not initialized yet');
      return;
    }

    // Show join form if user doesn't exist in localStorage
    if (userId==='123' && userEmail==='example@gmail.com') {
      setShowJoinForm(true);
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
  }, [isMicCamToggledOn, call, userId, userEmail]);

  const handleJoinRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const generatedUserId = `guest_${uuidv4()}`;
      const generatedToken = `token_${uuidv4().replace(/-/g, '')}`;
      
      localStorage.setItem('userId', generatedUserId);
      localStorage.setItem('email', joinRequest.email);
      localStorage.setItem('name', joinRequest.name);
      localStorage.setItem('token', generatedToken);
      
      const response = await fetch('/api/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: call?.id,
          name: joinRequest.name,
          email: joinRequest.email,
          userId: generatedUserId,
          status: 'pending' // Make sure this is set to pending
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit join request');
      }
  
      setIsRequestSubmitted(true);
      alert('Your join request has been submitted. Please wait for approval.');
      router.refresh();
    } catch (error) {
      console.error('Error submitting join request:', error);
      alert('Failed to submit join request. Please try again.');
    }
  };
// Add this useEffect hook to your MeetingSetup component
useEffect(() => {
  if (!call || !userId) return;

  const checkApprovalStatus = async () => {
    try {
      const response = await fetch(`/api/check-approval?callId=${call.id}&userId=${userId}`);
      if (!response.ok) throw new Error('Failed to check approval status');
      
      const data = await response.json();
      if (data.status === 'approved') {
        // User has been approved, join the meeting
        try {
          await call.join();
          setIsSetupComplete(true);
        } catch (error) {
          console.error('Error joining meeting:', error);
          alert('Failed to join meeting after approval. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

  // Check every 5 seconds if the user has been approved
  const interval = setInterval(checkApprovalStatus, 5000);
  return () => clearInterval(interval);
}, [call, userId, setIsSetupComplete]);
  if (!call) {
    return <div>Loading call setup...</div>;
  }

  if (isRequestSubmitted) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
        <h1 className="text-2xl font-bold">Request Submitted</h1>
        <p className="text-lg">Your request to join the meeting has been submitted.</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Waiting for host approval...</p>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
        <h1 className="text-2xl font-bold">Request to Join Meeting</h1>
        
        <form onSubmit={handleJoinRequestSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-lg">Your Name</label>
            <input
              type="text"
              id="name"
              value={joinRequest.name}
              onChange={(e) => setJoinRequest({...joinRequest, name: e.target.value})}
              className="rounded-md bg-gray-700 px-4 py-2 text-white"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-lg">Your Email</label>
            <input
              type="email"
              id="email"
              value={joinRequest.email}
              onChange={(e) => setJoinRequest({...joinRequest, email: e.target.value})}
              className="rounded-md bg-gray-700 px-4 py-2 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            className="rounded-md bg-green-400 px-4 py-2.5 mt-4"
          >
            Submit Request
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <h1 className="text-2xl font-bold">Meeting Setup</h1>

      {/* Show user's email and host tag */}
      {userEmail && (
        <p className="text-lg">
          {userName || userEmail} {isHost && <span className="text-green-400 font-semibold">(Host)</span>}
        </p>
      )}

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
            setIsSetupComplete(true);
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