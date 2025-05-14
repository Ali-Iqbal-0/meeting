'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Select from 'react-select';

interface Participant {
  _id: string;
  name: string;
  email: string;
}

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: (selectedParticipants: string[], externalEmails: string[]) => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLink?: string;
  callDetails?: any;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
  meetingDate = 'TBD',
  meetingTime = 'TBD',
  meetingLink = 'https://your-app.com/meeting/123',
  callDetails,
}: MeetingModalProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [externalEmails, setExternalEmails] = useState<string[]>([]);

  // Fetch participants from API
  useEffect(() => {
    if (isOpen) {
      const fetchParticipants = async () => {
        try {
          const res = await fetch('/api/participants');
          const data = await res.json();
          if (res.ok) {
            setParticipants(data);
            console.log(data);
          } else {
            alert('Error: Failed to fetch participants');
          }
        } catch (error) {
          alert('Error: Network error');
        }
      };
      fetchParticipants();
    }
  }, [isOpen]);

  // Handle adding external email
  const addExternalEmail = () => {
    if (!inviteEmail) {
      alert('Error: Please enter an email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      alert('Error: Please enter a valid email');
      return;
    }
    if (externalEmails.includes(inviteEmail)) {
      alert('Error: Email already added');
      return;
    }

    setExternalEmails([...externalEmails, inviteEmail]);
    setInviteEmail('');
  };

  // Handle removing external email
  const removeExternalEmail = (email: string) => {
    setExternalEmails(externalEmails.filter((e) => e !== email));
  };

  // Options for react-select
  const participantOptions = participants.map((participant) => ({
    value: participant._id,
    label: `${participant.name} (${participant.email})`,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-gray-800 px-6 py-9 text-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className={cn('text-2xl font-bold text-center', className)}>
            {title}
          </DialogTitle>
        </DialogHeader>

        {!callDetails && (
          <>
            {/* Participants Dropdown */}
            <div className="flex flex-col gap-2">
              <label htmlFor="participants" className="text-sm font-medium text-gray-200">
                Select Participants
              </label>
              <Select
                id="participants"
                isMulti
                options={participantOptions}
                value={participantOptions.filter((option) => selectedParticipants.includes(option.value))}
                onChange={(selected) => setSelectedParticipants(selected.map((option) => option.value))}
                className="text-black"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    color: 'white',
                    padding: '2px',
                    borderRadius: '6px',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#1F2937',
                    color: 'white',
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#3B82F6' : '#1F2937',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#374151',
                    },
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2563EB',
                    },
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'white',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#9CA3AF',
                  }),
                }}
                placeholder="Select participants..."
              />
            </div>

            {/* External Invite */}
            <div className="flex flex-col gap-2">
              <label htmlFor="inviteEmail" className="text-sm font-medium text-gray-200">
                Invite External User
              </label>
              <div className="flex gap-2">
                <input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={addExternalEmail}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Email
                </button>
              </div>
              {externalEmails.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-200">Added Emails:</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {externalEmails.map((email) => (
                      <li
                        key={email}
                        className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 text-sm text-white"
                      >
                        {email}
                        <button
                          onClick={() => removeExternalEmail(email)}
                          className="ml-1 text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {children && <div className="text-gray-300">{children}</div>}

        {image && (
          <div className="flex justify-center">
            <Image src={image} alt={`${title} icon`} width={72} height={72} />
          </div>
        )}

        {handleClick && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => handleClick(selectedParticipants, externalEmails)}
          >
            {buttonIcon && (
              <Image src={buttonIcon} alt={`${buttonText || 'Action'} icon`} width={13} height={13} />
            )}
            {buttonText || 'Schedule Meeting'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;