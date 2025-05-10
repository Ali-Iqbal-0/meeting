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
import React, { useState } from 'react';
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

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
const searchParams=useSearchParams();
const {useCallCallingState}=useCallStateHooks();
const callingState=useCallCallingState(); 
const isPersonalRoom=!!searchParams.get('personal');
if(callingState !== CallingState.JOINED) return <Loader/>
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
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        {/* Sidebar for CallParticipantsList */}
        <div
          className={cn(
            'absolute right-0 top-4 h-[calc(100vh-86px)] w-64 bg-[#19232d] transition-all duration-300',
            showParticipants ? 'block' : 'hidden'
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
        <CallControls />

        <CallStatsButton />

        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className={cn(
            'cursor-pointer rounded-2xl px-4 py-2',
            showParticipants ? 'bg-[#4c535b]' : 'bg-[#19232d]',
            'hover:bg-[#4c535b]'
          )}
          aria-label="Toggle participants list"
        >
          <Users size={20} className="text-white" />
        </button>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-amber-400 bg-amber-700 text-white">
            {(['grid', 'speaker-left', 'speaker-right'] as CallLayoutType[]).map(
              (item, index) => (
                <React.Fragment key={index}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setLayout(item)}
                  >
                    {item}
                  </DropdownMenuItem>
                  {index < 2 && (
                    <DropdownMenuSeparator className="border-b-gray-400" />
                  )}
                </React.Fragment>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {!isPersonalRoom &&<EndCallButton/>}
      </div>
    </section>
  );
};

export default MeetingRoom;