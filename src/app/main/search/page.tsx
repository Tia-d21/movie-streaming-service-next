"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X, ChevronDown } from "lucide-react";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";

// Import the new discoverMedia function
import {
  searchMedia,
  getGenreList,
  discoverMedia,
} from "../../../app/services/tmdb";
import { MediaItem } from "../../../app/data/mockData";

interface Genre {
  id: number;
  name: string;
}

const POPULAR_GENRE_NAMES = new Set([
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Horror",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Thriller",
]);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Discover Movies & TV Shows");

  // Filter states
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "tv">(
    "all"
  );
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  // State for genre lists and dropdown UI
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING: Get Genre Lists on Mount (Unchanged) ---
  useEffect(() => {
    const fetchGenres = async () => {
      const movies = await getGenreList("movie");
      const tv = await getGenreList("tv");
      setMovieGenres(
        movies.filter((genre) => POPULAR_GENRE_NAMES.has(genre.name))
      );
      setTvGenres(tv.filter((genre) => POPULAR_GENRE_NAMES.has(genre.name)));
    };
    fetchGenres();
  }, []);

  // --- REFACTORED: Main Data Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const genreIds = selectedGenres.map((g) => g.id);

      // 1. If user is typing, prioritize search
      if (query.trim() !== "") {
        setPageTitle(`Results for "${query}"`);
        const searchResults = await searchMedia(query, selectedType);

        // Apply client-side filters on top of search results
        let filtered = searchResults;
        if (selectedYear) {
          filtered = filtered.filter(
            (item) => item.releaseYear?.toString() === selectedYear
          );
        }
        if (genreIds.length > 0) {
          filtered = filtered.filter((item) =>
            genreIds.every((id) => item.genres.includes(id))
          );
        }
        setResults(filtered);
      }
      // 2. If search is empty, but filters are active, use discover
      else if (selectedType !== "all" || selectedYear || genreIds.length > 0) {
        setPageTitle("Discover Results");

        let movieResults: MediaItem[] = [];
        let tvResults: MediaItem[] = [];

        // Fetch movies if type is 'movie' or 'all'
        if (selectedType === "movie" || selectedType === "all") {
          movieResults = await discoverMedia("movie", selectedYear, genreIds);
        }
        // Fetch TV shows if type is 'tv' or 'all'
        if (selectedType === "tv" || selectedType === "all") {
          tvResults = await discoverMedia("tv", selectedYear, genreIds);
        }

        // Combine and set results
        setResults([...movieResults, ...tvResults]);
      }
      // 3. If no query and no filters, show nothing.
      else {
        setResults([]);
        setPageTitle("Discover Movies & TV Shows");
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedType, selectedYear, selectedGenres]);

  // --- Other useEffects and Handlers (Unchanged) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenreToggle = (genre: Genre) => {
    setSelectedGenres((prev) =>
      prev.some((g) => g.id === genre.id)
        ? prev.filter((g) => g.id !== genre.id)
        : [...prev, genre]
    );
  };

  const displayedGenres = [...movieGenres, ...tvGenres].filter(
    (genre, index, self) => index === self.findIndex((g) => g.id === genre.id)
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        {/* --- RESTORED: Filter Controls --- */}
        <div className="mb-8 p-4 bg-gray-900/50 rounded-lg">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              autoFocus
            />
            <SearchIcon
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label
                htmlFor="type-filter"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Content Type
              </label>
              <div className="relative">
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as "all" | "movie" | "tv")
                  }
                  className="w-full appearance-none bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All</option>
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="year-filter"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Release Year
              </label>
              <input
                id="year-filter"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="e.g., 2023"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div className="relative" ref={genreDropdownRef}>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Popular Genres
              </label>
              <button
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="w-full flex justify-between items-center text-left bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <span className="truncate pr-2">
                  {selectedGenres.length > 0
                    ? selectedGenres.map((g) => g.name).join(", ")
                    : "Select genres..."}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 transition-transform ${
                    isGenreDropdownOpen ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </button>
              {isGenreDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 w-full bg-gray-700 border border-gray-600 rounded-md p-2 z-10 max-h-48 overflow-y-auto"
                >
                  {displayedGenres.map((genre) => (
                    <div
                      key={genre.id}
                      onClick={() => handleGenreToggle(genre)}
                      className={`cursor-pointer flex items-center justify-between w-full px-3 py-1.5 my-1 text-sm rounded transition-colors ${
                        selectedGenres.some((g) => g.id === genre.id)
                          ? "bg-red-600 text-white"
                          : "text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <span>{genre.name}</span>
                      {selectedGenres.some((g) => g.id === genre.id) && (
                        <X size={14} />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* --- RESTORED: Applied Filters "Tags" --- */}
        {(selectedYear || selectedGenres.length > 0) && (
          <div className="mb-6 flex items-center flex-wrap gap-2">
            <h3 className="text-sm font-semibold mr-2">Applied Filters:</h3>
            {selectedYear && (
              <div className="flex items-center bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                Year: {selectedYear}
                <button
                  onClick={() => setSelectedYear("")}
                  className="ml-2 text-gray-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {selectedGenres.map((genre) => (
              <div
                key={genre.id}
                className="flex items-center bg-gray-700 text-white text-xs px-2 py-1 rounded-full"
              >
                {genre.name}
                <button
                  onClick={() => handleGenreToggle(genre)}
                  className="ml-2 text-gray-300 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {/* The "Clear All" button that was here has been removed. */}
          </div>
        )}

        {/* --- RESTORED & IMPROVED: Results Display --- */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <motion.div
              className="w-12 h-12 border-t-4 border-red-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : (
          <div>
            {results.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4">{pageTitle}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {results.map((item) => (
                    <MovieCard key={item.id} {...item} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="mx-auto mb-4 text-gray-500" size={48} />
                <h2 className="text-2xl mb-2">
                  {query || selectedYear || selectedGenres.length > 0
                    ? "No Results Found"
                    : "Discover Movies & TV Shows"}
                </h2>
                <p className="text-gray-400">
                  {query || selectedYear || selectedGenres.length > 0
                    ? "Try adjusting your search or filters."
                    : "Use the filters above to browse our library."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
