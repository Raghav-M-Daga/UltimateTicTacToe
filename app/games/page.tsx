'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function GamesPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Choose Game Mode
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/games/single')}
          className="bg-blue-600 p-6 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Single Player
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/games/local')}
          className="bg-green-600 p-6 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Local Multiplayer
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/games/online')}
          className="bg-purple-600 p-6 rounded-lg text-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          Online Multiplayer
        </motion.button>
      </div>
    </div>
  );
} 