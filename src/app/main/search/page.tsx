"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X, ChevronDown } from "lucide-react";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { MediaItem } from "../../../app/data/mockData";
import * as tmdbApi from "../../../app/services/tmdb";

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

  const [selectedType, setSelectedType] = useState<"all" | "movie" | "tv">(
    "all"
  );
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const genreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      const movies = await tmdbApi.getGenreList("movie");
      const tv = await tmdbApi.getGenreList("tv");
      if (Array.isArray(movies)) {
        setMovieGenres(
          movies.filter((genre) => POPULAR_GENRE_NAMES.has(genre.name))
        );
      }
      if (Array.isArray(tv)) {
        setTvGenres(tv.filter((genre) => POPULAR_GENRE_NAMES.has(genre.name)));
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const genreIds = selectedGenres.map((g) => g.id);

      if (query.trim() !== "") {
        setPageTitle(`Results for "${query}"`);
        const searchResults = await tmdbApi.searchMedia(query, selectedType);
        setResults(searchResults);
      } else if (
        selectedType !== "all" ||
        selectedYear ||
        genreIds.length > 0
      ) {
        setPageTitle("Discover Results");
        const allDiscoveredResults: MediaItem[] = [];

        if (selectedType === "movie" || selectedType === "all") {
          const movieResults = await tmdbApi.discoverMedia(
            "movie",
            selectedYear,
            genreIds
          );
          allDiscoveredResults.push(...movieResults);
        }
        if (selectedType === "tv" || selectedType === "all") {
          const tvResults = await tmdbApi.discoverMedia(
            "tv",
            selectedYear,
            genreIds
          );
          allDiscoveredResults.push(...tvResults);
        }
        setResults(allDiscoveredResults);
      } else {
        setResults([]);
        setPageTitle("Discover Movies & TV Shows");
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedType, selectedYear, selectedGenres]);

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
        {/* --- [RESTORED] Filter Controls Section --- */}
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

        {/* --- [RESTORED] Results Display Section --- */}
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
                    <MovieCard key={`${item.id}-${item.category}`} {...item} />
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
