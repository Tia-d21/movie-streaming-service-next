"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import VideoPlayer from "../../../../app/components/ui/VideoPlayer";
import { fetchMediaDetails } from "../../../../app/services/tmdb";
import { MediaItem } from "../../../../app/data/mockData";
import { useWatchHistory } from "../../../../app/hooks/useWatchHistory"; // 1. Import the hook

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNextEpisode, setShowNextEpisode] = useState(false);

  // 2. Instantiate the hook to get the addToHistory function
  const { addToHistory } = useWatchHistory();

  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      const category = params.category as "movie" | "tv";
      const id = params.id as string;

      if (category && id) {
        const foundItem = await fetchMediaDetails(id, category);
        setItem(foundItem);
      }
      setIsLoading(false);
    };

    loadMedia();
  }, [params.category, params.id]);

  // 3. Add a new useEffect to add the item to history once it's loaded
  useEffect(() => {
    if (item) {
      // This will add the current movie/show to the user's watch history.
      // The logic inside the hook handles moving it to the top if already watched.
      addToHistory(item);
    }
  }, [item, addToHistory]); // This effect runs whenever 'item' changes

  useEffect(() => {
    if (item?.category === "tv") {
      const nextEpisodeTimer = setTimeout(() => {
        setShowNextEpisode(true);
      }, 5000); // Show next episode suggestion after 5 seconds
      return () => clearTimeout(nextEpisodeTimer);
    }
  }, [item]);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-t-4 border-red-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <ChevronLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 z-50 p-4">
        <button
          onClick={handleGoBack}
          className="cursor-pointer flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white py-2 px-4 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </div>

      <div className="relative w-full">
        <div className="w-full h-screen bg-black">
          <VideoPlayer trailerKey={item.trailerKey} />
        </div>

        {item.category === "tv" && showNextEpisode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 p-4 bg-black/80 rounded-lg max-w-md w-full"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={item.posterPath}
                  alt={item.title}
                  width={96}
                  height={144}
                  className="rounded"
                />
              </div>
              <div>
                <h3 className="font-medium text-lg">{item.title}</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Next Episode: S{item.seasons} E
                  {Math.floor(Math.random() * 10) + 2}
                </p>
                <div className="flex gap-2">
                  <button className="bg-white text-black py-1 px-4 rounded-md text-sm font-medium">
                    Play
                  </button>
                  <button
                    onClick={() => setShowNextEpisode(false)}
                    className="bg-gray-700 text-white py-1 px-4 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}