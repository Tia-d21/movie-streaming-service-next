'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserProfile } from '../../../app/hooks/useUserProfile'; // Import the hook

export default function LogoutPage() {
  const router = useRouter();
  const logout = () => {
    localStorage.clear(); // Clear all localStorage data including user profile and movie list
  }; // Use a simple logout function instead of the hook

  useEffect(() => {
    // Call the centralized logout function from our hook.
    // This will clear both the user profile and the movie list from localStorage.
    logout();

    // Redirect to the login page after a 2-second delay for a smoother UX.
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 2000);

    // Cleanup the timer if the component unmounts for any reason
    return () => clearTimeout(timer);
  }, [router, logout]); // Dependency array ensures this runs once

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-4">
      <motion.div
        className="w-16 h-16 border-t-4 border-red-600 rounded-full mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <h1 className="text-3xl font-bold mb-2">Logging You Out</h1>
      <p className="text-gray-400">Please wait while we securely sign you out of your account.</p>
    </div>
  );
}