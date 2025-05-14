'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModel';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { v4 as uuidv4 } from 'uuid';

type MeetingState = 'isInstantMeeting' | 'isScheduleMeeting' | 'isJoinMeeting' | undefined;

const MeetingTypeList = () => {
  const router = useRouter();
  const [values, setValues] = useState<{
    dateTime: Date;
    description: string;
    link: string;
  }>({
    dateTime: new Date(),
    description: '',
    link: '',
  });
  const [callDetails, setCallDetails] = useState<Call | undefined>(undefined);
  const [meetingState, setMeetingState] = useState<MeetingState>(undefined);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const client = useStreamVideoClient();

  // Handle modal close and reset state
  const handleCloseModal = () => {
    setMeetingState(undefined);
    setCallDetails(undefined);
    setValues({ dateTime: new Date(), description: '', link: '' });
  };

  // Handle setting meeting state
  const handleSetMeetingState = (state: MeetingState) => {
    setMeetingState(state);
    setCallDetails(undefined);
  };

  const sendInvites = async (
    participantIds: string[],
    externalEmails: string[],
    meetingLink: string,
    title: string,
    date: string,
    time: string
  ) => {
    try {
      // Send invites to selected participants
      if (participantIds.length > 0) {
        const res = await fetch('/api/participants');
        const participants = await res.json();
        if (!res.ok) throw new Error('Failed to fetch participants');

        const selectedParticipants = participants.filter((p: any) =>
          participantIds.includes(p._id)
        );

        for (const participant of selectedParticipants) {
          const inviteRes = await fetch('/api/send-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: participant.email,
              meetingLink,
              title,
              date,
              time,
            }),
          });

          const inviteData = await inviteRes.json();
          if (!inviteRes.ok) {
            alert(`Error: Failed to send invite to ${participant.email}: ${inviteData.error}`);
          }
        }
      }

      // Send invites to external emails
      for (const email of externalEmails) {
        const inviteRes = await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            meetingLink,
            title,
            date,
            time,
          }),
        });

        const inviteData = await inviteRes.json();
        if (!inviteRes.ok) {
          alert(`Error: Failed to send invite to ${email}: ${inviteData.error}`);
        }
      }
    } catch (error) {
      alert('Error: Failed to send invites');
    }
  };

  const createMeeting = async (selectedParticipants: string[], externalEmails: string[]) => {
    if (!client || !userId || !token) {
      alert('Error: Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      let callId = uuidv4();
      const checkResponse = await fetch(`/api/meetings?callId=${callId}`);
      if (checkResponse.ok && (await checkResponse.json())) {
        callId = uuidv4();
      }

      const call = client.call('default', callId);

      const date = new Date().toISOString();
      const title = values.description || 'Instant Meeting';
      const meetingType = 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at: date,
          custom: {
            description: title,
            creatorId: userId,
            meetingType,
            requiresJoinRequest: true,
          },
          members: [{ user_id: userId, role: 'host' }],
        },
      });

      setCallDetails(call);

      const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callId}`;
      const requestBody = {
        callId,
        title,
        date,
        creatorId: userId,
        meetingLink,
        meetingType,
        pendingParticipants: selectedParticipants,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to save meeting: ${response.status}`);
      }

      // Send invites to selected participants and external emails
      if (selectedParticipants.length > 0 || externalEmails.length > 0) {
        await sendInvites(
          selectedParticipants,
          externalEmails,
          meetingLink,
          title,
          new Date().toISOString().split('T')[0],
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        alert('Success: Invites sent to participants');
      }

      setMeetingState('isInstantMeeting');
    } catch (error) {
      console.error('Error creating instant meeting:', error);
      alert(`Error: Failed to create meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createScheduleMeeting = async (selectedParticipants: string[], externalEmails: string[]) => {
    if (!client || !userId || !token) {
      alert('Error: Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      let callId = uuidv4();
      const checkResponse = await fetch(`/api/meetings?callId=${callId}`);
      if (checkResponse.ok && (await checkResponse.json())) {
        callId = uuidv4();
      }

      const call = client.call('default', callId);

      const date = values.dateTime.toISOString();
      const title = values.description || 'Scheduled Meeting';
      const meetingType = 'Scheduled Meeting';

      await call.getOrCreate({
        data: {
          starts_at: date,
          custom: {
            description: title,
            creatorId: userId,
            meetingType,
            requiresJoinRequest: true,
          },
          members: [{ user_id: userId, role: 'host' }],
        },
      });

      setCallDetails(call);

      const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callId}`;
      const requestBody = {
        callId,
        title,
        date,
        creatorId: userId,
        meetingLink,
        meetingType,
        pendingParticipants: selectedParticipants,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to save meeting: ${response.status}`);
      }

      // Send invites to selected participants and external emails
      if (selectedParticipants.length > 0 || externalEmails.length > 0) {
        await sendInvites(
          selectedParticipants,
          externalEmails,
          meetingLink,
          title,
          values.dateTime.toISOString().split('T')[0],
          values.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        alert('Success: Invites sent to participants');
      }

      setMeetingState('isScheduleMeeting');
    } catch (error) {
      console.error('Error creating scheduled meeting:', error);
      alert(`Error: Failed to create meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleJoinMeeting = () => {
    if (!values.link) {
      alert('Error: Please enter a meeting link');
      return;
    }

    const url = values.link.trim();
    const callId = url.split('/').filter(Boolean).pop();

    if (callId && callId !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(callId)) {
      router.push(`/${callId}?request=true`);
    } else {
      alert('Error: Invalid meeting link. Please provide a valid meeting URL.');
    }
  };

  const meetingLink = callDetails
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callDetails.id}`
    : '';

  const meetingDate = values.dateTime.toISOString().split('T')[0];
  const meetingTime = values.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="Instant Meeting"
        description="Start an Instant Meeting"
        handleClick={() => handleSetMeetingState('isInstantMeeting')}
        className="bg-amber-600"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan Your Meeting"
        handleClick={() => handleSetMeetingState('isScheduleMeeting')}
        className="bg-blue-500"
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check out your recordings"
        handleClick={() => router.push('/recordings')}
        className="bg-purple-500"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via Invitation Link"
        handleClick={() => handleSetMeetingState('isJoinMeeting')}
        className="bg-yellow-500"
      />

      {/* Instant Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={handleCloseModal}
        title={callDetails ? 'Instant Meeting Created' : 'Start an Instant Meeting'}
        className="text-center"
        buttonText={callDetails ? 'Join Meeting' : 'Start Meeting'}
        handleClick={callDetails ? () => router.push(`/${callDetails.id}`) : createMeeting}
        meetingDate={new Date().toISOString().split('T')[0]}
        meetingTime={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        meetingLink={meetingLink}
        callDetails={callDetails}
      >
        {callDetails ? (
          <div className="flex flex-col gap-3">
            <p className="text-gray-300">
              Meeting Link: <a href={meetingLink} className="text-blue-400 underline">{meetingLink}</a>
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                alert('Success: Link copied to clipboard');
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Copy Meeting Link
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22px] text-gray-200">Add a Description</label>
            <Textarea
              className="rounded-md border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
              onChange={(e) => setValues({ ...values, description: e.target.value })}
              value={values.description}
            />
          </div>
        )}
      </MeetingModal>

      {/* Scheduled Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isScheduleMeeting'}
        onClose={handleCloseModal}
        title={callDetails ? 'Meeting Created' : 'Create Meeting'}
        className="text-center"
        buttonText={callDetails ? 'Join Meeting' : 'Create Meeting'}
        handleClick={callDetails ? () => router.push(`/${callDetails.id}`) : createScheduleMeeting}
        meetingDate={meetingDate}
        meetingTime={meetingTime}
        meetingLink={meetingLink}
        callDetails={callDetails}
      >
        {callDetails ? (
          <div className="flex flex-col gap-3">
            <p className="text-gray-300">
              Meeting Link: <a href={meetingLink} className="text-blue-400 underline">{meetingLink}</a>
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                alert('Success: Link copied to clipboard');
              }}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Copy Meeting Link
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              <label className="text-base font-normal leading-[22px] text-gray-200">Add a Description</label>
              <Textarea
                className="rounded-md border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                value={values.description}
              />
            </div>
            <div className="flex w-full flex-col gap-2.5">
              <label className="text-base font-normal leading-[22px] text-gray-200">Select Date & Time</label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date: Date | null) => setValues({ ...values, dateTime: date || new Date() })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </>
        )}
      </MeetingModal>

      {/* Join Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isJoinMeeting'}
        onClose={handleCloseModal}
        title="Join a Meeting"
        className="text-center"
        buttonText="Request to Join"
        handleClick={handleJoinMeeting}
      >
        <div className="flex flex-col gap-2.5">
          <label className="text-base font-normal leading-[22px] text-gray-200">Meeting Link</label>
          <input
            type="text"
            className="w-full rounded-md border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="Enter meeting link (e.g., http://localhost:3000/<callId>)"
            onChange={(e) => setValues({ ...values, link: e.target.value })}
            value={values.link}
          />
        </div>
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;