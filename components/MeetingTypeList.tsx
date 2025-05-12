'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModel';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { v4 as uuidv4 } from 'uuid';

const MeetingTypeList = () => {
  const router = useRouter();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: '',
  });
  const [callDetails, setCallDetails] = useState<Call | undefined>();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoinMeeting' | 'isInstantMeeting' | undefined
  >(undefined);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const client = useStreamVideoClient();

  console.log('MeetingTypeList - userId:', userId, 'token:', token ? token.slice(0, 10) + '...' : null, 'client:', client);

  const createMeeting = async () => {
    if (!client || !userId || !token) {
      console.error('Client, userId, or token not available');
      alert('Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      const callId = uuidv4();
      const call = client.call('default', callId);

      if (!call) {
        throw new Error('Failed to create call');
      }

      const startsAt = new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            creatorId: userId,
          },
        },
      });

      setCallDetails(call);
      console.log('Instant meeting created with ID:', callId);

      router.push(`/${callId}`);
    } catch (error) {
      console.error('Error creating instant meeting:', error);
      alert('Failed to create meeting. Please try again.');
    }
  };

  const createScheduleMeeting = async () => {
    if (!client || !userId || !token) {
      console.error('Client, userId, or token not available');
      alert('Please sign in to create a meeting');
      router.push('/signin');
      return;
    }

    try {
      const callId = uuidv4();
      const call = client.call('default', callId);

      if (!call) {
        throw new Error('Failed to create call');
      }

      const startsAt = values.dateTime.toISOString();
      const description = values.description || 'Scheduled Meeting';

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            creatorId: userId,
          },
        },
      });

      setCallDetails(call);
      console.log('Scheduled meeting created with ID:', callId);

      setMeetingState('isScheduleMeeting');
    } catch (error) {
      console.error('Error creating scheduled meeting:', error);
      alert('Failed to create meeting. Please try again.');
    }
  };

  const meetingLink = `http://localhost:3000/meeting/${callDetails?.id}`;

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
      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createScheduleMeeting}
        >
          <span className="flex flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px]">
              Add a Description
            </label>
            <Textarea
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </span>
          <span className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px]">
              Select Date & Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="bg-gray-600 w-full rounded p-2 focus:outline-none"
            />
          </span>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
        >
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
            <button
              onClick={() => router.push(`/meeting/${callDetails?.id}`)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Join Meeting
            </button>
          </div>
        </MeetingModal>
      )}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;