"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Plus,
  X,
  ChevronLeft,
  ThumbsUp,
  Star,
  Trash2,
} from "lucide-react";
import Navbar from "../../../app/components/layout/Navbar";
import Footer from "../../../app/components/layout/Footer";
import MovieCard from "../../../app/components/ui/MovieCard";
import { MediaItem } from "../../../app/data/mockData";
import { fetchMediaDetails } from "../../../app/services/tmdb";
import { useMyList } from "../../../app/hooks/useMyList";
import { useFavorites } from "../../../app/hooks/useFavorites";
import { useUserProfile } from "../../../app/hooks/useUserProfile";
import { useAuthModal } from "../../../app/hooks/useAuthModal";
import { fetchWithAuth } from "../../../lib/apiHelper";

interface Comment {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function MovieDetails() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showRatingWidget, setShowRatingWidget] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(0);
  const [currentComment, setCurrentComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const { user } = useUserProfile();
  const { openModal } = useAuthModal();
  const { addToMyList, removeFromMyList, isInMyList } = useMyList();
  const { toggleFavorite, isFavorite } = useFavorites();

  // --- [NEW] Function to fetch all comments for the movie ---
  const fetchMovieComments = useCallback(async (movieId: string) => {
    try {
      // This is a public endpoint, so no need for fetchWithAuth
      const response = await fetch(`/api/movies/${movieId}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Could not fetch comments", error);
    }
  }, []);

  // --- [NEW] Function to fetch the logged-in user's rating for this movie ---
  const fetchUserRating = useCallback(
    async (movieId: string) => {
      // Only try to fetch a rating if the user is logged in.
      if (!user) return;
      try {
        const data = await fetchWithAuth(`/api/users/rating/${movieId}`);
        if (data && data.value) {
          setCurrentUserRating(data.value);
        }
      } catch (error) {
        // A 404 or null response is expected if no rating exists, so we can ignore the error.
        console.log("No existing rating found for this user.");
      }
    },
    [user]
  );

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      const category = params.category as "movie" | "tv";
      const id = params.id as string;
      if (category && id) {
        // Fetch public movie data from TMDB proxy
        const foundItem = await fetchMediaDetails(id, category);
        setItem(foundItem);

        // --- [NEW] After loading the movie, fetch its comments and the user's rating ---
        await fetchMovieComments(id);
        await fetchUserRating(id);
      }
      setIsLoading(false);
    };
    loadDetails();
  }, [params.id, params.category, fetchMovieComments, fetchUserRating]);

  // All handler functions (handlePlay, handleCommentSubmit, etc.) remain unchanged.
  // ... (rest of the handler functions) ...

  const handleGoBack = () => router.back();

  const handlePlay = () => {
    if (user && item) {
      router.push(`/watch/${item.category}/${item.id}`);
    } else {
      openModal();
    }
  };

  const handleToggleMyList = () => {
    if (!user || !item) {
      openModal();
      return;
    }
    isInMyList(item.id) ? removeFromMyList(item.id) : addToMyList(item);
  };

  const handleToggleFavorite = () => {
    if (!user || !item) {
      openModal();
      return;
    }
    toggleFavorite(item);
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!user || !item) {
      openModal();
      return;
    }
    try {
      await fetchWithAuth("/api/users/rating", {
        method: "POST",
        body: JSON.stringify({ movieData: item, value: rating }),
      });
      setCurrentUserRating(rating);
      setShowRatingWidget(false);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert("Could not save your rating. Please try again.");
    }
  };
  const handleDeleteRating = async () => {
    if (!user || !item) return;

    if (window.confirm("Are you sure you want to remove your rating?")) {
      try {
        await fetchWithAuth("/api/users/rating", {
          method: "DELETE",
          body: JSON.stringify({ movieId: item.id }),
        });
        // Reset the rating state on the frontend
        setCurrentUserRating(0);
        setShowRatingWidget(false); // Hide the widget if it was open
      } catch (error) {
        console.error("Failed to delete rating:", error);
        alert("Could not remove your rating. Please try again.");
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !item || !currentComment.trim()) {
      openModal();
      return;
    }

    try {
      const newComment = await fetchWithAuth("/api/users/feedback", {
        method: "POST",
        body: JSON.stringify({
          movieId: parseInt(item.id, 10),
          message: currentComment,
        }),
      });
      // Add the new comment to the state to update UI instantly
      setComments((prev) => [
        { ...newComment, user: { name: user.name } },
        ...prev,
      ]);
      setCurrentComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post your comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await fetchWithAuth("/api/users/feedback", {
          method: "DELETE",
          body: JSON.stringify({ id: commentIdToDelete }),
        });
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentIdToDelete)
        );
      } catch (error) {
        console.error("Failed to delete comment:", error);
        alert("Could not delete the comment. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            className="w-16 h-16 border-t-4 border-red-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <ChevronLeft size={20} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isItemInMyList = item ? isInMyList(item.id) : false;
  const isItemFavorite = item ? isFavorite(item.id) : false;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* --- [RESTORED] TOP HERO SECTION --- */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={item.backdropPath || "/backdrop-placeholder.svg"}
            alt={item.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end pb-20 px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-2/3 lg:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {item.title}
            </h1>

            <div className="flex items-center text-sm text-gray-300 mb-4 flex-wrap">
              <div className="flex items-center mr-4 bg-black/50 p-1 rounded-md">
                <Star size={16} className="text-yellow-400 mr-1.5" />
                <span className="font-bold text-base text-white">
                  {item.rating} ★
                </span>
              </div>
              <span>{item.releaseYear}</span>
              {item.duration && (
                <>
                  <span className="mx-2">•</span> <span>{item.duration}</span>
                </>
              )}
              {item.seasons && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.seasons} Seasons</span>
                </>
              )}
            </div>

            <p className="text-gray-300 mb-8 line-clamp-3 md:line-clamp-4">
              {item.overview}
            </p>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="flex items-center bg-white text-black px-6 py-2 rounded font-medium cursor-pointer"
              >
                <Play className="mr-2" size={20} /> Play
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleMyList}
                className="flex items-center bg-gray-600/80 text-white px-6 py-2 rounded font-medium cursor-pointer"
              >
                {isItemInMyList ? (
                  <X className="mr-2" size={20} />
                ) : (
                  <Plus className="mr-2" size={20} />
                )}
                {isItemInMyList ? "Remove from My List" : "Add to My List"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleFavorite}
                className={`flex items-center px-4 py-2 rounded font-medium cursor-pointer transition-colors ${
                  isItemFavorite
                    ? "bg-red-600 text-white"
                    : "bg-gray-600/80 text-white"
                }`}
              >
                <ThumbsUp
                  className="mr-2"
                  size={20}
                  fill={isItemFavorite ? "currentColor" : "none"}
                />
                {isItemFavorite ? "Favorited" : "Favorite"}
              </motion.button>
            </div>

            <div className="mt-6">
              <button
                onClick={() =>
                  user ? setShowRatingWidget(!showRatingWidget) : openModal()
                }
                className="text-white hover:text-yellow-400 transition-colors text-l font-semibold cursor-pointer"
              >
                {currentUserRating > 0
                  ? `You rated this ${currentUserRating} ★`
                  : "Rate this movie"}
              </button>

              {showRatingWidget && user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-1 mt-2 bg-black/50 p-2 rounded-md w-fit"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Star
                        size={28}
                        className={`cursor-pointer transition-colors ${
                          star <= currentUserRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-500"
                        }`}
                        onClick={() => handleRatingSubmit(star)}
                      />
                    </motion.div>
                  ))}

                  {/* The new Delete button appears here when a rating exists */}
                  {currentUserRating > 0 && (
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="ml-2 border-l border-gray-600 pl-2"
                    >
                      <Trash2
                        size={22}
                        className="cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                        onClick={handleDeleteRating}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- [RESTORED] MAIN CONTENT AREA --- */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* --- CAST & CREW SECTION --- */}
        {item.cast && item.cast.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6">Cast & Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {item.cast.map((person, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2">
                    <Image
                      src={person.profilePath}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm md:text-base">
                    {person.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    {person.character}
                  </p>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* --- MORE LIKE THIS SECTION --- */}
        {item.similar && item.similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {item.similar.map((similarItem) => (
                <MovieCard
                  key={similarItem.id}
                  {...similarItem}
                  overview=""
                  backdropPath=""
                  releaseYear=""
                  rating=""
                  genres={[]}
                  cast={[]}
                  similar={[]}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- COMMENT SECTION --- */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Comments on {item.title}</h2>
          <div className="mb-8 max-w-2xl">
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                placeholder={
                  user
                    ? `Commenting as ${user.name}...`
                    : "Please log in to add a comment"
                }
                className="w-full bg-gray-800 text-white p-3 rounded-md focus:ring-2 focus:ring-red-600 outline-none transition disabled:bg-gray-900"
                rows={3}
                disabled={!user}
              />
              <div className="text-right">
                <button
                  type="submit"
                  className="cursor-pointer mt-2 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!user || !currentComment.trim()}
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
          <div className="space-y-4 max-w-2xl">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-900/50 p-4 rounded-lg border border-gray-800"
                >
                  <div className="flex items-center mb-2">
                    <p className="font-bold text-white">{comment.user.name}</p>
                    <p className="text-gray-400 text-xs ml-auto">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {comment.message}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-900/50 rounded-lg max-w-2xl">
                <p className="text-gray-500">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
