'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import React, { useState, useEffect } from 'react';


interface PendingParticipant {
  userId: string;
  name: string;
  email: string;
  _id: string;
}

const PendingRequestsPanel = () => {
  const call = useCall();
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { useCallCustomData } = useCallStateHooks();
  const customData = useCallCustomData();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const isHost = customData?.creatorId === userId;

  useEffect(() => {
    if (!call || !isHost) return;

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch(`/api/pending-requests?callId=${call.id}`);
        if (!response.ok) throw new Error('Failed to fetch pending requests');
        
        const data = await response.json();
        setPendingParticipants(data.participants);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    // Fetch initially and then every 10 seconds
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 10000);

    return () => clearInterval(interval);
  }, [call, isHost]);

  const handleRequestAction = async (participantId: string, action: 'accept' | 'reject') => {
    if (!call || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/handle-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: call.id,
          participantId,
          action
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      // Update local state
      setPendingParticipants(prev => 
        prev.filter(p => p._id !== participantId)
      );

      // If accepted, you can log or handle the acceptance logic here
      if (action === 'accept') {
        console.log(`Participant ${participantId} has been accepted.`);
        // Add any additional logic if needed
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost || pendingParticipants.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
      >
        <span>Pending Requests ({pendingParticipants.length})</span>
      </button>

      {showPanel && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-800 rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-lg font-semibold mb-3">Pending Join Requests</h3>
          <div className="max-h-60 overflow-y-auto">
            {pendingParticipants.map((participant) => (
              <div key={participant._id} className="mb-3 p-2 bg-gray-700 rounded">
                <p className="font-medium">{participant.name}</p>
                <p className="text-sm text-gray-400">{participant.email}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRequestAction(participant._id, 'accept')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(participant._id, 'reject')}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsPanel;