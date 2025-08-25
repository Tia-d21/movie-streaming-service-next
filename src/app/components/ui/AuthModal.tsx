"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "../../../app/hooks/useAuthModal";

export default function AuthModal() {
  const { isOpen, closeModal } = useAuthModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-md text-center relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">
              Sign up to start watching
            </h2>
            <p className="text-gray-400 mb-8">
              Create an account to play content, add to your list, and more.
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/auth/signup" passHref>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="cursor-pointer w-full py-3 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition duration-200"
                >
                  Sign Up
                </motion.button>
              </Link>
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" passHref>
                  <span
                    onClick={closeModal}
                    className="text-white font-medium hover:underline cursor-pointer"
                  >
                    Log In
                  </span>
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
