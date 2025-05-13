'use client';

import { cn } from '@/lib/utils';
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import React, { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutList, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import EndCallButton from './EndCallButton';
import Loader from './Loader';
import '@stream-io/video-react-sdk/dist/css/styles.css';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const [layout, setLayout] = React.useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = React.useState(false);
  const searchParams = useSearchParams();
  const { useCallCallingState, useCallCustomData } = useCallStateHooks();
  const callingState = useCallCallingState();
  const customData = useCallCustomData();
  const isPersonalRoom = !!searchParams.get('personal');

  // Synchronously fetch userId from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // Debug call state and data
  React.useEffect(() => {
    console.log('Calling State:', callingState);
    console.log('Custom Data:', customData);
    console.log('User ID:', userId);
    console.log('Is Host:', isHost);
  }, [callingState, customData, userId]);

  // Memoize isHost to avoid recomputation unless dependencies change
  const isHost = useMemo(() => {
    if (!userId || !customData?.creatorId) return false;
    return customData.creatorId === userId;
  }, [customData, userId]);

  // Handle loading and error states
  if (callingState !== CallingState.JOINED) {
    if (callingState === CallingState.RECONNECTING) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
          Reconnecting to the meeting...
        </div>
      );
    } else if (callingState === CallingState.OFFLINE) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
          Offline. Please check your network and try again.
        </div>
      );
    }
    return <Loader />;
  }

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="right" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">
      {/* Main Video Layout */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-[1200px] items-center justify-center">
          <CallLayout />
        </div>
        {/* Participants List (Slide-in Panel) */}
        <div
          className={cn(
            'absolute right-0 top-4 h-[calc(100vh-96px)] w-72 bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out',
            showParticipants ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-4 bg-gray-800 p-4 shadow-lg">
        {/* Stream.io Call Controls (Mic, Camera, Screen Share, Leave) */}
        <div className="flex items-center gap-2">
          <CallControls
            onLeave={() => {
              window.location.href = '/'; // Redirect to homepage after leaving
            }}
          />
        </div>

        {/* Call Stats Button */}
        <CallStatsButton />

        {/* Toggle Participants List */}
        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
            showParticipants ? 'bg-blue-600' : 'bg-gray-700',
            'hover:bg-blue-500 transition-colors'
          )}
          aria-label="Toggle participants list"
        >
          <Users size={20} />
          <span>Participants</span>
        </button>

        {/* Layout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors">
            <LayoutList size={20} />
            <span>Layout</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border border-gray-600 bg-gray-700 text-white">
            {(['grid', 'speaker-left', 'speaker-right'] as CallLayoutType[]).map((item, index) => (
              <React.Fragment key={index}>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-600"
                  onClick={() => setLayout(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </DropdownMenuItem>
                {index < 2 && <DropdownMenuSeparator className="bg-gray-600" />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* End Call Button (Host Only) */}
        {isHost && !isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;