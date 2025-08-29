"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { User, KeyRound, X } from "lucide-react"; // Import X icon
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import {
  useWatchHistory,
  WatchedItem,
} from "../../../app/hooks/useWatchHistory";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("account");
  const { user, isLoading } = useUserProfile();

  // Destructure all needed functions from the history hook
  const { history, clearHistory, removeFromHistory } = useWatchHistory();

  // Handler for the "Clear All" button with a confirmation dialog
  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire watch history? This action cannot be undone."
      )
    ) {
      clearHistory();
    }
  };

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
          {/* --- Sidebar with User Info (Unchanged) --- */}
          <div className="md:w-1/4">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center text-white flex-shrink-0">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold truncate">
                    {user?.name || "Guest User"}
                  </h2>
                  <p className="text-gray-400 text-sm truncate">
                    {user?.email || "no-email@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Main Content Area --- */}
          <div className="md:w-3/4">
            <div className="bg-gray-900 rounded-lg p-6">
              {activeTab === "account" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    Account Information
                  </h2>
                  <div className="space-y-8">
                    {/* --- PRESERVED: PROFILE DETAILS SECTION --- */}
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

                    {/* --- PRESERVED: SECURITY SECTION --- */}
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

                    {/* --- IMPROVED: WATCH HISTORY SECTION --- */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium">Watch History</h3>
                        {history.length > 0 && (
                          <button
                            onClick={handleClearHistory}
                            className="text-xs font-semibold text-red-500 hover:text-red-400 hover:underline transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        {history.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {history.map((watchedItem: WatchedItem) => (
                              <div
                                key={watchedItem.id}
                                className="relative group"
                              >
                                <button
                                  onClick={() =>
                                    removeFromHistory(watchedItem.id)
                                  }
                                  className="absolute top-2 right-2 z-20 p-1.5 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                                  aria-label={`Remove ${watchedItem.title} from history`}
                                >
                                  <X size={16} />
                                </button>
                                <MovieCard {...watchedItem} />
                                <p className="text-xs text-center text-gray-400 mt-2">
                                  Watched{" "}
                                  {new Date(
                                    watchedItem.watchedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              Your watch history is empty.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
