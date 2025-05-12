'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

const Navbar = () => {
  const router = useRouter();
  const client = useStreamVideoClient();

  const logout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        // Clear localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('email');

        // Disconnect Stream.io client
        if (client) {
          await client.disconnectUser();
          console.log('Stream client disconnected');
        }

        // Clear HTTP-only cookie
        await fetch('/api/auth/logout', {
          method: 'POST',
        });

        console.log('Logged out successfully');
        router.push('/signin');
        router.refresh();
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
      }
    }
  };

  return (
    <nav className="flex justify-between items-center z-50 w-full bg-gray-800 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/icons/logo.svg"
          width={100}
          height={100}
          alt="logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold text-white max-sm:hidden">
          FAIR FORSE MEETING
        </p>
      </Link>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;