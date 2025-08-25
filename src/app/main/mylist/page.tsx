"use client";

import { motion } from "framer-motion";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { useMyList } from "../../../app/hooks/useMyList";
import Link from "next/link";
// We no longer need the 'X' icon imported directly on this page
// import { X } from 'lucide-react';

export default function MyListPage() {
  // The hook logic remains exactly the same.
  const { myList, isLoading } = useMyList();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">My List</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="w-12 h-12 border-t-4 border-red-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : myList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
            {/* --- THIS IS THE FIX --- */}
            {/* We remove the wrapper div and the separate 'X' button. */}
            {/* The MovieCard itself now handles the remove functionality when hovered. */}
            {myList.map((item) => (
              <MovieCard key={item.id} {...item} />
            ))}
            {/* --- END OF FIX --- */}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
            <p className="text-gray-400 mb-6">
              Add movies and TV shows to your list to watch them later.
            </p>
            <Link href="/main/browse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md font-medium transition-colors"
              >
                Browse Content
              </motion.button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
