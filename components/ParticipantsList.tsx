'use client';

import { useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';

const ParticipantsList = () => {
  const call = useCall();
  const { useCallCustomData } = useCallStateHooks();
  const customData = useCallCustomData();

  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const isMainHost = customData?.creatorId === userId; // Only creator can assign co-hosts

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/participants-host?callId=${call?.id}`);
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      alert('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const initiateCoHostRequest = (participant: any) => {
    setSelectedParticipant(participant);
    setShowConfirmation(true);
  };

  const makeCoHost = async (accepted: boolean) => {
    try {
      const response = await fetch('/api/make-cohost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: call?.id,
          userId: selectedParticipant.userId,
          currentHostId: userId,
          accepted,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (accepted) {
          await fetchParticipants(); // Refresh participant list
          sendCoHostNotification(selectedParticipant.userId, true);
        }
        alert(result.message);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert('Request failed');
    } finally {
      setShowConfirmation(false);
      setSelectedParticipant(null);
    }
  };

  const sendCoHostNotification = (userId: string, accepted: boolean) => {
    // Implement your notification system here
    console.log(`User ${userId} ${accepted ? 'accepted' : 'declined'} co-host request`);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          if (!showParticipants) fetchParticipants();
          setShowParticipants(!showParticipants);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md shadow-sm transition"
      >
        <Users className="h-4 w-4" />
        <span>Make Co-Host ({participants.length})</span>
      </button>

      {showParticipants && (
        <div className="fixed top-0 right-0 z-50 h-full w-80 bg-gray-800 border-l shadow-xl animate-slide-in p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Make Co-Host</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-white hover:text-red-500 text-sm"
            >
              X
            </button>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading participants...</p>
            ) : (
              participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-start justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition"
                >
                  <div className="text-sm">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-white">{p.email}</p>
                    {p.isHost && (
                      <span className="text-xs text-blue-600 font-semibold">
                        {p.userId === customData?.creatorId ? 'Main Host' : 'Co-Host'}
                      </span>
                    )}
                  </div>
                  {isMainHost && p.userId !== userId && (
                    <button
                      onClick={() => initiateCoHostRequest(p)}
                      className="text-white hover:text-gray-100 text-sm underline"
                    >
                      {p.isHost ? 'Remove Host' : 'Make Co-Host'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedParticipant?.isHost ? 'Remove Host' : 'Add Co-Host'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedParticipant?.isHost
                ? `Are you sure you want to remove ${selectedParticipant?.name} as a co-host?`
                : `${selectedParticipant?.name} will be notified to accept co-host rights. They will gain full host controls.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => makeCoHost(!selectedParticipant?.isHost)}>
              {selectedParticipant?.isHost ? 'Remove' : 'Send Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ParticipantsList;