'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main browse page
    router.push('/main/browse');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-16 h-16 border-t-4 border-red-600 rounded-full animate-spin" />
    </div>
  );
}
