'use client';

import { useRouter } from 'next/navigation';
import UltimateTicTacToe from '../../components/UltimateTicTacToe';

export default function OnlineGamePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/games')}
          className="mb-8 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Game Modes
        </button>
        <UltimateTicTacToe 
          mode="online" 
          onBack={() => router.push('/games')} 
        />
      </div>
    </div>
  );
} 