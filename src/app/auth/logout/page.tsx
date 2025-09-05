"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserProfile } from "../../../app/hooks/useUserProfile";

export default function LogoutPage() {
  const router = useRouter();
  // Get the centralized logout function from our hook
  const { logout } = useUserProfile();

  useEffect(() => {
    // Call the logout function which handles clearing state and localStorage.
    // The redirect is now handled inside the hook itself.
    logout();

    // The rest of this component is for showing a "Logging out..." message,
    // but the actual state change and redirect logic is now centralized.
    // The redirect in the hook will likely happen before this message is seen for long.
    const timer = setTimeout(() => {
      // Fallback redirect in case the one in the hook fails for some reason
      if (window.location.pathname.includes("/logout")) {
        router.push("/auth/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, logout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-4">
      <motion.div
        className="w-16 h-16 border-t-4 border-red-600 rounded-full mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <h1 className="text-3xl font-bold mb-2">Logging You Out</h1>
      <p className="text-gray-400">
        Please wait while we securely sign you out of your account.
      </p>
    </div>
  );
}
