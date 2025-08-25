"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, ChevronDown } from "lucide-react";
import { useUserProfile } from "../../../app/hooks/useUserProfile";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- 1. ADD NEW STATE TO MANAGE THE LOGOUT LOADING SCREEN ---
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useUserProfile();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutConfirm(true);
  };

  // --- 2. UPDATE THE LOGOUT LOGIC TO INCLUDE THE LOADING STATE ---
  const confirmLogout = () => {
    // First, close the confirmation modal
    setShowLogoutConfirm(false);
    // Then, show our full-screen loading overlay
    setIsLoggingOut(true);

    // Use a timer to simulate the secure logout process and give feedback
    const timer = setTimeout(() => {
      logout(); // Clear the user's session
      router.push("/main/browse"); // Redirect to the home page
      setIsLoggingOut(false); // Clean up the state
    }, 2000); // 2-second delay for a better UX

    // Clean up the timer if the component unmounts unexpectedly
    return () => clearTimeout(timer);
  };
  // --- END OF LOGIC UPDATE ---

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const isAuthPage = pathname?.includes("/auth");
  if (isAuthPage) return null;

  const currentCategory = searchParams.get("category");

  const navLinks = [
    {
      label: "Home",
      href: "/main/browse",
      isActive: pathname === "/main/browse" && !currentCategory,
    },
    {
      label: "TV Shows",
      href: "/main/browse?category=tv",
      isActive: pathname === "/main/browse" && currentCategory === "tv",
    },
    {
      label: "Movies",
      href: "/main/browse?category=movies",
      isActive: pathname === "/main/browse" && currentCategory === "movies",
    },
    {
      label: "My List",
      href: "/main/mylist",
      isActive: pathname === "/main/mylist",
    },
    {
      label: "Favorites",
      href: "/main/favorites",
      isActive: pathname === "/main/favorites",
    },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          isScrolled
            ? "bg-black"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <Link href="/main/browse" className="flex-shrink-0">
                <span className="text-red-600 font-bold text-2xl md:text-3xl">
                  NETSTREAM
                </span>
              </Link>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      link.isActive
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/main/search"
                className="text-gray-300 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Link>
              <button className="text-gray-300 hover:text-white">
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className="flex items-center text-gray-300 hover:text-white"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="h-7 w-7 rounded bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center text-white cursor-pointer">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown
                    className={`cursor-pointer ml-1 h-4 w-4 transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-black/90 border border-gray-700 rounded shadow-lg py-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {user ? (
                        <>
                          <Link
                            href="/main/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            Account
                          </Link>
                          <Link
                            href="/main/profile/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            Settings
                          </Link>
                          <div className="my-1 border-t border-gray-700" />
                          <button
                            onClick={handleLogoutClick}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                          >
                            Log Out
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/auth/login"
                          onClick={() => setShowProfileMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Sign In
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
            >
              <h2 className="text-xl font-medium text-white mb-4">Log Out</h2>
              <p className="text-gray-400 mb-8">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelLogout}
                  className="px-8 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors cursor-pointer"
                >
                  No, Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-8 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors cursor-pointer"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 3. ADD THE NEW LOGGING OUT LOADING OVERLAY --- */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[110] text-center p-4"
          >
            <motion.div
              className="w-16 h-16 border-t-4 border-red-600 rounded-full mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h1 className="text-3xl font-bold mb-2 text-white">
              Logging You Out
            </h1>
            <p className="text-gray-400">
              Please wait while we securely sign you out of your account.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
