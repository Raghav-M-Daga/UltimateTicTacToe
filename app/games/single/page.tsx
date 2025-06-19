'use client';

import { useRouter } from 'next/navigation';
import UltimateTicTacToe from '../../components/UltimateTicTacToe';
import ProtectedRoute from '../../components/ProtectedRoute';

function SinglePlayerGameContent() {
  const router = useRouter();

  return (
    <UltimateTicTacToe 
      mode="single" 
      onBack={() => router.push('/games')} 
    />
  );
}

export default function SinglePlayerGame() {
  return (
    <ProtectedRoute>
      <SinglePlayerGameContent />
    </ProtectedRoute>
  );
} 