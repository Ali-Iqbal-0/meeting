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
import React, { useEffect, useState } from 'react';
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
import PendingRequestsPanel from './PendingRequestsPanel';
import ParticipantsList from '@/components/ParticipantsList';
import { useCall } from '@stream-io/video-react-sdk';
import HostRequestNotification from './Notification';


type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

interface UserPermissions {
  canManageParticipants: boolean;
  canEndCall: boolean;
  canViewStats: boolean;
  canModifyHosts: boolean;
}

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const searchParams = useSearchParams();
  const { useCallCallingState, useCallCustomData } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const customData = useCallCustomData();
  const isPersonalRoom = !!searchParams.get('personal');


  const [userRole, setUserRole] = useState<'host' | 'cohost' | 'participant'>('participant');
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canManageParticipants: false,
    canEndCall: false,
    canViewStats: false,
    canModifyHosts: false
  });

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
// Add this useEffect to your MeetingRoom component
useEffect(() => {
  const handleRoleChange = (event: StorageEvent) => {
    if (event.key === 'userRole' && event.newValue) {
      setUserRole(event.newValue as 'host' | 'cohost' | 'participant');
      // You might want to refetch permissions here
    }
  };

  window.addEventListener('storage', handleRoleChange);
  return () => window.removeEventListener('storage', handleRoleChange);
}, []);

// Update the syncUserRole function to store role in localStorage

  useEffect(() => {
    const syncUserRole = async () => {
      if (!userId || !call?.id) return;
  
      try {
        const response = await fetch(`/api/get-user-role?callId=${call.id}&userId=${userId}&t=${Date.now()}`);
        const data = await response.json();
  
        if (response.ok) {
          if (data.role !== userRole) setUserRole(data.role);
          if (JSON.stringify(data.permissions) !== JSON.stringify(userPermissions)) {
            setUserPermissions(data.permissions);
          }
        }
      } catch (error) {
        console.error('Error syncing user role:', error);
      }
    };
  
    syncUserRole();
    const interval = setInterval(syncUserRole, 10000);
    return () => clearInterval(interval);
  }, [userId, call?.id, userRole, userPermissions]);
  

  if (callingState !== CallingState.JOINED) {
    if (callingState === CallingState.RECONNECTING) {
      return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Reconnecting to the meeting...
      </div>;
    }
    return <Loader />;
  }

  const CallLayout = () => {
    switch (layout) {
      case 'grid': return <PaginatedGridLayout />;
      case 'speaker-right': return <SpeakerLayout participantsBarPosition="left" />;
      default: return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900 text-white">

      {/* User info */}
      {userEmail && (
        <div className="absolute top-4 right-4 z-50 rounded-md bg-gray-800 px-4 py-2 text-sm text-white shadow-md">
          {userEmail} 
          {userRole === 'host' && <span className="text-blue-400"> (host)</span>}
          {userRole === 'cohost' && <span className="text-green-400"> (co-host)</span>}
        </div>
      )}

      {/* Main video layout */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-[1200px] items-center justify-center">
          <CallLayout />
        </div>

        {/* Participants panel */}
        <div className={cn(
          'absolute right-0 top-4 h-[calc(100vh-96px)] w-72 bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out',
          showParticipants ? 'translate-x-0' : 'translate-x-full'
        )}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      <HostRequestNotification />

      {/* Bottom controls bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-4 bg-gray-800 p-4 shadow-lg">
        {/* Basic controls for everyone */}
        <div className="flex items-center gap-2">
          <CallControls onLeave={() => window.location.href = '/'} />
        </div>

        {/* Host and co-host controls */}
        {userPermissions.canManageParticipants && <PendingRequestsPanel />}
        {userPermissions.canViewStats && <CallStatsButton />}
        {userPermissions.canManageParticipants && !isPersonalRoom && <ParticipantsList />}
        {userPermissions.canEndCall && !isPersonalRoom && <EndCallButton />}

        {/* Participants toggle */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
            showParticipants ? 'bg-blue-600' : 'bg-gray-700',
            'hover:bg-blue-500 transition-colors'
          )}
        >
          <Users size={20} />
          <span>Participants</span>
        </button>

        {/* Layout selection */}
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
      </div>
    </section>
  );
};

export default MeetingRoom;