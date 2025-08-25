'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { MediaItem } from '../../../app/data/mockData';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../app/hooks/useUserProfile';
import { useAuthModal } from '../../../app/hooks/useAuthModal';

type HeroBannerProps = {
  item: MediaItem;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 1.2,
    ease: "easeOut",
  },
};

export default function HeroBanner({ item }: HeroBannerProps) {
  const router = useRouter();
  const { user } = useUserProfile();
  const { openModal } = useAuthModal();

  const handlePlay = () => {
    if (user) {
      router.push(`/watch/${item.category}/${item.id}`);
    } else {
      openModal();
    }
  };

  return (
    <div className="relative w-full h-[80vh] overflow-hidden">
      
      <AnimatePresence>
        <motion.div
          key={item.id + '-image'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 1.5, ease: 'easeInOut' } }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: 'easeInOut' } }}
        >
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1 }}
            animate={{ scale: 1.13 }}
            transition={{
              duration: 13,
              ease: "linear",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <Image
              src={item.backdropPath || '/backdrop-placeholder.svg'}
              alt={item.title}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-end pb-20 px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <AnimatePresence>
          <motion.div
            key={item.id + '-content'}
            className="w-full md:w-2/3 lg:w-1/2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit" 
          >
            <motion.h1
              variants={childVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              {item.title}
            </motion.h1>
            
            <motion.div
              variants={childVariants}
              className="flex items-center text-sm text-gray-300 mb-4"
            >
              <span className="bg-red-600 text-white px-2 py-0.5 rounded mr-3">{item.rating}</span>
              <span>{item.releaseYear}</span>
              {item.duration && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.duration}</span>
                </>
              )}
            </motion.div>
            
            <motion.p
              variants={childVariants}
              className="text-gray-300 mb-8 line-clamp-3 md:line-clamp-4"
            >
              {item.overview}
            </motion.p>
            
            <motion.div
              variants={childVariants}
              className="flex space-x-4"
            >
              <motion.button
                onClick={handlePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-white text-black px-6 py-2 rounded font-medium cursor-pointer"
              >
                <Play className="mr-2" size={20} />
                Play
              </motion.button>
              
              <Link href={`/${item.category}/${item.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center bg-gray-600/80 text-white px-6 py-2 rounded font-medium cursor-pointer"
                >
                  <Info className="mr-2" size={20} />
                  More Info
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}