'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useState } from 'react';

export default function GamesPage() {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Rules Button and Dropdown */}
      <div className="w-full max-w-4xl">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRules(!showRules)}
          className="bg-gray-800 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>{showRules ? 'Hide' : 'Show'} Rules</span>
          <svg
            className={`w-5 h-5 transition-transform ${showRules ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-gray-900 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Ultimate Tic Tac Toe Rules</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">🎯 Objective</h3>
                <p className="text-gray-300">
                  Win three mini-boards in a row (horizontally, vertically, or diagonally) to win the game.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-green-400">🎮 Basic Rules</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• The game consists of 9 mini-boards arranged in a 3x3 grid</li>
                  <li>• Players take turns placing X or O in any empty cell</li>
                  <li>• The first player to get three in a row in any mini-board wins that board</li>
                  <li>• Once a mini-board is won, it cannot be played in again</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">📍 Forced Move Rule</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Your move determines where your opponent must play next</li>
                  <li>• If you play in cell 5 of mini-board 2, your opponent must play in mini-board 5</li>
                  <li>• If the target mini-board is already won or full, your opponent can play anywhere</li>
                  <li>• On the first move, you can play anywhere on any board</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-400">🏆 Winning Conditions</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Win three mini-boards in a row (like regular tic-tac-toe)</li>
                  <li>• The three winning mini-boards can be horizontal, vertical, or diagonal</li>
                  <li>• If all mini-boards are filled without a winner, the game is a draw</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-red-400">🎯 Strategy Tips</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Think ahead: your move affects where your opponent plays next</li>
                  <li>• Try to send your opponent to boards you have already won</li>
                  <li>• Block your opponent from winning mini-boards</li>
                  <li>• Control the center mini-board for better strategic positioning</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-indigo-400">🎮 Game Modes</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• <span className="text-blue-400">Single Player:</span> Play against an AI opponent</li>
                  <li>• <span className="text-green-400">Local Multiplayer:</span> Play with a friend on the same device</li>
                  <li>• <span className="text-purple-400">Online Multiplayer:</span> Play with friends online in real-time</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 