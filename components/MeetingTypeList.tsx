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

  const createMeeting = async () => {
    if (!client || !userId || !token) {
      alert('Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      const callId = uuidv4();
      const call = client.call('default', callId);

      const date = new Date().toISOString();
      const title = values.description || 'Instant Meeting';
      const meetingType='Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: date,
          custom: {
            description: title,
            creatorId: userId,
            meetingType:meetingType,
          },
        },
      });

      setCallDetails(call);

      // Save to MongoDB
      const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callId}`;
      const requestBody = {
        callId,
        title,
        date,
        creatorId: userId,
        meetingLink,
        meetingType,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save meeting');
      }

      setMeetingState('isInstantMeeting');
    } catch (error) {
      console.error('Error creating instant meeting:', error);
      alert(`Failed to create meeting: ${(error as Error).message}`);
    }
  };

  const createScheduleMeeting = async () => {
    if (!client || !userId || !token) {
      alert('Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      const callId = uuidv4();
      const call = client.call('default', callId);

      const date = values.dateTime.toISOString();
      const title = values.description || 'Scheduled Meeting';
      const meetingType='Scheduled Meeting';

      await call.getOrCreate({
        data: {
          starts_at: date,
          custom: {
            description: title,
            creatorId: userId,
            meetingType:meetingType,
          },
        },
      });

      setCallDetails(call);

      // Save to MongoDB
      const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callId}`;
      const requestBody = {
        callId,
        title,
        date,
        creatorId: userId,
        meetingLink,
        meetingType,
      };

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save meeting');
      }

      setMeetingState('isScheduleMeeting');
    } catch (error) {
      console.error('Error creating scheduled meeting:', error);
      alert(`Failed to create meeting: ${(error as Error).message}`);
    }
  };

  const meetingLink = callDetails ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${callDetails.id}` : '';

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="Instant Meeting"
        description="Start an Instant Meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
        className="bg-amber-600"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan Your Meeting"
        handleClick={() => setMeetingState('isScheduleMeeting')}
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
        handleClick={() => setMeetingState('isJoinMeeting')}
        className="bg-yellow-500"
      />
      <HomeCard
        img="/icons/meetings.svg"
        title="View Meetings"
        description="Check out your meetings"
        handleClick={() => router.push('/meetings')}
        className="bg-green-500"
      />
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title={callDetails ? 'Instant Meeting Created' : 'Start an Instant Meeting'}
        className="text-center"
        buttonText={callDetails ? 'Join Meeting' : 'Start Meeting'}
        handleClick={callDetails ? () => router.push(`/${callDetails.id}`) : createMeeting}
      >
        {callDetails ? (
          <div className="flex flex-col gap-3">
            <p>Meeting Link: {meetingLink}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                alert('Link Copied!');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Copy Meeting Link
            </button>
          </div>
        ) : null}
      </MeetingModal>
      <MeetingModal
        isOpen={meetingState === 'isScheduleMeeting'}
        onClose={() => setMeetingState(undefined)}
        title={callDetails ? 'Meeting Created' : 'Create Meeting'}
        handleClick={callDetails ? () => router.push(`/${callDetails.id}`) : createScheduleMeeting}
      >
        {callDetails ? (
          <div className="flex flex-col gap-3">
            <p>Meeting Link: {meetingLink}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                alert('Link Copied!');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Copy Meeting Link
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              <label className="text-base font-normal leading-[22px]">Add a Description</label>
              <Textarea
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(e) => setValues({ ...values, description: e.target.value })}
              />
            </div>
            <div className="flex w-full flex-col gap-2.5">
              <label className="text-base font-normal leading-[22px]">Select Date & Time</label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date: Date | null) => setValues({ ...values, dateTime: date || new Date() })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="bg-gray-600 w-full rounded p-2 focus:outline-none"
              />
            </div>
          </>
        )}
      </MeetingModal>
      <MeetingModal
        isOpen={meetingState === 'isJoinMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Join a Meeting"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => {
          if (values.link) {
            const callId = values.link.split('/').pop();
            if (callId) {
              router.push(`/${callId}`);
            } else {
              alert('Invalid meeting link');
            }
          } else {
            alert('Please enter a meeting link');
          }
        }}
      >
        <div className="flex flex-col gap-2.5">
          <label className="text-base font-normal leading-[22px]">Meeting Link</label>
          <input
            type="text"
            className="bg-gray-600 w-full rounded p-2 focus:outline-none"
            placeholder="Enter meeting link (e.g., http://localhost:3000/<callId>)"
            onChange={(e) => setValues({ ...values, link: e.target.value })}
          />
        </div>
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;