"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { User, KeyRound, X, Pencil, Check, XCircle } from "lucide-react";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { motion } from "framer-motion";
import { useWatchHistory } from "../../../app/hooks/useWatchHistory";
import { fetchWithAuth } from "../../../lib/apiHelper";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isLoading: isUserLoading,
    token,
    updateUserProfile,
  } = useUserProfile();
  const {
    history,
    isLoading: isHistoryLoading,
    fetchHistory,
    removeFromHistory,
  } = useWatchHistory();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, fetchHistory]);

  const handleEditClick = () => {
    setApiError("");
    setIsEditingName(true);
  };

  const handleCancelClick = () => {
    setNewName(user?.name || "");
    setIsEditingName(false);
  };

  const handleSaveClick = async () => {
    if (!user || newName.trim() === "" || newName === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    setApiError("");
    try {
      const updatedUser = await fetchWithAuth(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: newName }),
      });
      updateUserProfile(updatedUser);
      setIsEditingName(false);
    } catch (error) {
      setApiError((error as Error).message || "Failed to update name.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- [MODIFIED] This is the main loading guard. ---
  // If we are loading OR if the user is null, we show the spinner.
  // The logic inside the useEffect above will handle the redirect.
  if (isUserLoading || !user) {
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

  // --- If the code reaches this point, TypeScript now knows that `user` MUST exist. ---
  // All errors related to 'user' being possibly 'null' are now gone.
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center text-white flex-shrink-0">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold truncate">{user.name}</h2>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Account Information</h2>
              {apiError && (
                <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">
                  {apiError}
                </p>
              )}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile Details</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center min-h-[40px]">
                      <span className="text-gray-400">Name</span>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-gray-700 text-white p-1 px-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            className="text-green-400 hover:text-green-300 disabled:opacity-50"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={handleCancelClick}
                            disabled={isSaving}
                            className="text-red-500 hover:text-red-400 disabled:opacity-50"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>{user.name}</span>
                          <button
                            onClick={handleEditClick}
                            className="text-gray-400 hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
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

                {/* Watch History Section now uses the global state */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Watch History</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {isHistoryLoading ? (
                      <div className="flex justify-center py-8">
                        <motion.div
                          className="w-8 h-8 border-t-2 border-red-600 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </div>
                    ) : history.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {history.map((watchedItem) => (
                          <div
                            key={`${watchedItem.id}-${watchedItem.watchedAt}`}
                            className="relative group"
                          >
                            <button
                              onClick={() => removeFromHistory(watchedItem.id)}
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
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
