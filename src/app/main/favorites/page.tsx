"use client";

import { motion } from "framer-motion";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { useFavorites } from "../../../app/hooks/useFavorites"; // Import the new hook
import Link from "next/link";
export const dynamic = 'force-dynamic'; 
export default function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              className="w-12 h-12 border-t-4 border-red-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
            {favorites.map((item) => (
              <MovieCard
                key={item.id}
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                releaseYear={item.releaseYear}
                rating={item.rating}
                duration={item.duration}
                category={item.category}
                overview={item.overview}
                backdropPath={item.backdropPath}
                genres={item.genres}
                cast={item.cast}
                similar={item.similar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              Your favorites list is empty
            </h3>
            <p className="text-gray-400 mb-6">
              Add movies and shows you love to your favorites.
            </p>
            <Link href="/main/browse">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md font-medium transition-colors"
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
