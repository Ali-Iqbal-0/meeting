'use client';

import { useState, useEffect } from 'react';
import { useCall } from '@stream-io/video-react-sdk';
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

interface Participant {
  userId: string;
  name: string;
  email: string;
  isHost: boolean;
  status: string;
  pendingHostRequest?: boolean;
}

export default function ParticipantsList() {
  const call = useCall();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [canModifyHosts, setCanModifyHosts] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
 

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!userId || !call?.id) return;
      try {
        const response = await fetch(`/api/get-user-role?callId=${call.id}&userId=${userId}&t=${Date.now()}`);
        const data = await response.json();
        if (response.ok) {
          setCanModifyHosts(data.permissions?.canModifyHosts || false);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };
    fetchPermissions();
  }, [userId, call?.id]);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/participants?callId=${call?.id}&t=${Date.now()}`);
      const data = await response.json();
      
      if (response.ok) {
        setParticipants(data.participants || []);
      } else {
        throw new Error(data.error || 'Failed to fetch participants');
      }
    } catch (error: any) {
      alert({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendHostRequest = async () => {
    if (!selectedParticipant || !userId || !call?.id) return;
    setIsSendingRequest(true);

    try {
      const response = await fetch('/api/send-host-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: call.id,
          targetUserId: selectedParticipant.userId,
          requesterId: userId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert({
          title: 'Request Sent',
          description: `Host request sent to ${selectedParticipant.name}`,
        });
        setParticipants(prev => prev.map(p => 
          p.userId === selectedParticipant.userId 
            ? { ...p, pendingHostRequest: true } 
            : p
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingRequest(false);
      setShowDialog(false);
    }
  };

  useEffect(() => {
    if (showPanel) {
      fetchParticipants();
      const interval = setInterval(fetchParticipants, 3000);
      return () => clearInterval(interval);
    }
  }, [showPanel]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowPanel(!showPanel);
          if (!showPanel) fetchParticipants();
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md shadow-sm transition"
      >
        <Users className="h-4 w-4" />
        <span>Manage Participants ({participants.length})</span>
      </button>

      {showPanel && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Participants</h3>
            <button 
              onClick={() => setShowPanel(false)} 
              className="text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              ✕
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {participants.map((p) => (
                <div key={p.userId} className="flex justify-between items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    <div className="flex gap-2 mt-1">
                      {p.isHost && (
                        <span className={`text-xs ${
                          p.userId === userId ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {p.userId === userId ? 'You' : p.userId === call?.state.createdBy?.id ? 'Main Host' : 'Co-Host'}
                        </span>
                      )}
                      {p.pendingHostRequest && (
                        <span className="text-xs text-yellow-400">Pending Request</span>
                      )}
                    </div>
                  </div>
                  {canModifyHosts && userId !== p.userId && !p.isHost && !p.pendingHostRequest && (
                    <button
                      onClick={() => {
                        setSelectedParticipant(p);
                        setShowDialog(true);
                      }}
                      className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition-colors whitespace-nowrap"
                      disabled={isLoading}
                    >
                      Make Host
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Host Request?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {`Send a host request to ${selectedParticipant?.name}? They will need to accept before becoming a co-host.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 border-none hover:bg-gray-600"
              disabled={isSendingRequest}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={sendHostRequest}
              className="bg-blue-600 hover:bg-blue-500"
              disabled={isSendingRequest}
            >
              {isSendingRequest ? 'Sending...' : 'Send Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}