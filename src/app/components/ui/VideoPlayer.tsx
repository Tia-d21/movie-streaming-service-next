"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";

type VideoPlayerProps = {
  trailerKey?: string;
};

export default function VideoPlayer({ trailerKey }: VideoPlayerProps) {
  // This state is crucial to prevent server-side rendering errors.
  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  const trailerUrl = trailerKey
    ? `https://www.youtube.com/watch?v=${trailerKey}`
    : null;

  return (
    <div className="relative w-full h-full">
      {/* We only render the player on the client-side */}
      {hasWindow && (
        <>
          {trailerUrl ? (
            <ReactPlayer
              // --- THIS IS THE FIX ---
              // The prop name is `src`, not `url`.
              src={trailerUrl}
              // --- END OF FIX ---

              playing={true}
              controls={true}
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              config={{
                youtube: {
                  // This config is correct with no `playerVars` nesting.
                },
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold">No Trailer Available</h2>
                <p className="text-gray-400">
                  A trailer for this title could not be found.
                </p>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
