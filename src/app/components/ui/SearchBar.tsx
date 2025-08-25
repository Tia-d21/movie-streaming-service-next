'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams?.get('q') || initialQuery;
  const [query, setQuery] = useState(queryFromUrl);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update search query when URL changes
  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/main/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center border-b ${isFocused ? 'border-white' : 'border-gray-600'} transition-colors`}>
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Titles, people, genres"
            className="bg-transparent text-white px-3 py-2 w-full focus:outline-none"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}