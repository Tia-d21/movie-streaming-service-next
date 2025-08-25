"use client";

import { useState } from "react";
import Link from "next/link"; // Import Link
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import { User, KeyRound } from "lucide-react"; // Import KeyRound icon
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("account");
  const { user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            className="w-16 h-16 border-t-4 border-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center text-white">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {user?.name || "Guest User"}
                  </h2>
                  <p className="text-gray-400 text-sm truncate">
                    {user?.email || "no-email@example.com"}
                  </p>
                </div>
              </div>
              <nav className="space-y-2">{/* ... nav buttons ... */}</nav>
            </div>
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            <div className="bg-gray-900 rounded-lg p-6">
              {activeTab === "account" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    Account Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Profile Details
                      </h3>
                      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Name</span>
                          <span>{user?.name || "..."}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Email</span>
                          <span>{user?.email || "..."}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Member Since</span>
                          <span>August 2025</span>
                        </div>
                      </div>
                    </div>

                    {/* --- THIS IS THE NEW SECTION --- */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">Security</h3>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Password</span>
                          <Link href="/main/profile/change-password">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="cursor-pointer flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                            >
                              <KeyRound className="mr-2" size={16} />
                              Change Password
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    {/* --- END OF NEW SECTION --- */}
                  </div>
                </div>
              )}
              {/* ... other tabs ... */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
