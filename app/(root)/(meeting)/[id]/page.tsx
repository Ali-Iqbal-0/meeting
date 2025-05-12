'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MeetingPage() {
  const params = useParams(); // Get params dynamically
  const id = params?.id as string; // Extract the `id` param

  const [meeting, setMeeting] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch meeting details if ID is not 'new'
  useEffect(() => {
    if (id !== 'new') {
      const fetchMeeting = async () => {
        try {
          const res = await fetch(`/api/meetings/${id}`);
          if (res.ok) {
            const data = await res.json();
            setMeeting(data);
          } else {
            setError('Failed to load meeting');
          }
        } catch (err) {
          setError('Something went wrong');
        }
      };
      fetchMeeting();
    }
  }, [id]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date }),
      });

      if (res.ok) {
        const newMeeting = await res.json();
        router.push(`/meeting/${newMeeting._id}`);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create meeting');
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
        {id === 'new' ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-center">Schedule a New Meeting</h2>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <form onSubmit={handleCreateMeeting}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Meeting Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Meeting
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="mb-6 text-2xl font-bold text-center">Meeting Details</h2>
            {error && <p className="mb-4 text-red-500">{error}</p>}
            {meeting ? (
              <div>
                <p className="mb-2">
                  <strong>Title:</strong> {meeting.title}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong> {new Date(meeting.date).toLocaleString()}
                </p>
                <p className="mb-2">
                  <strong>Created by:</strong> {meeting.userId}
                </p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
