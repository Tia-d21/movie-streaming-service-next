// movie-streaming-app\src\app\main\search\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import Navbar from '../../../app/components/layout/Navbar';
import Footer from '../../../app/components/layout/Footer';
import MovieCard from '../../../app/components/ui/MovieCard';

// 1. Import our NEW search function and the MediaItem type
import { searchMedia } from '../../../app/services/tmdb';
import { MediaItem } from '../../../app/data/mockData';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // This useEffect handles the debounced search logic, now with a real API call
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // This debounce timer is still a great idea to prevent spamming the API
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true); // Start loading animation
      
      // 2. Call our new async function from the tmdb service
      const searchResults = await searchMedia(query, selectedFilter);

      setResults(searchResults);
      setIsLoading(false); // Stop loading animation once results are back
    }, 500); // Wait 500ms after the user stops typing

    return () => clearTimeout(debounceTimer);

  }, [query, selectedFilter]); // Re-run effect when query or filter changes

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              autoFocus
            />
            <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
          
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-colors ${selectedFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('movie')}
              className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-colors ${selectedFilter === 'movie' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedFilter('tv')}
              className={`cursor-pointer px-4 py-2 text-sm rounded-full transition-colors ${selectedFilter === 'tv' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              TV Shows
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              className="w-16 h-16 border-t-4 border-red-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <div>
            {query.trim() !== '' && results.length > 0 ? (
              <>
                <h2 className="text-xl mb-4">Results for &quot;{query}&quot;</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {results.map((item) => (
                    // --- THIS IS THE FIX ---
                    // Use the spread operator to pass all properties of `item`.
                    <MovieCard
                      key={item.id}
                      {...item}
                    />
                    // --- END OF FIX ---
                  ))}
                </div>
              </>
            ) : query.trim() !== '' && results.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl mb-2">No results found for &quot;{query}&quot;</h2>
                <p className="text-gray-400">Try different keywords or filters</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="mx-auto mb-4 text-gray-500" size={48} />
                <h2 className="text-2xl mb-2">Search for movies and TV shows</h2>
                <p className="text-gray-400">Find your favorite content</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}