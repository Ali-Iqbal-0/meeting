"use client"
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import { useRouter } from 'next/navigation';
import React from 'react'

const EndCallButton = () => {
    const call=useCall();
    const router= useRouter();
    const {useLocalParticipant}=useCallStateHooks();
    const LocalParticipant=useLocalParticipant();

    const isMeetingOwner= LocalParticipant && call?.state.createdBy && LocalParticipant.userId === call.state.createdBy.id;
 if(!isMeetingOwner) return null;
    return (
    <button onClick={async()=>{
        await call.endCall();
        router.push('/');
    }} className='bg-red-500 rounded-3xl cursor-pointer '>
End Call for Everyone
    </button>
  )
}

export default EndCallButton