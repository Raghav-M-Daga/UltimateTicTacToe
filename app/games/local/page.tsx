'use client';

import { useRouter } from 'next/navigation';
import UltimateTicTacToe from '../../components/UltimateTicTacToe';
import ProtectedRoute from '../../components/ProtectedRoute';

function LocalMultiplayerGameContent() {
  const router = useRouter();

  return (
    <UltimateTicTacToe 
      mode="multi" 
      onBack={() => router.push('/games')} 
    />
  );
}

export default function LocalMultiplayerGame() {
  return (
    <ProtectedRoute>
      <LocalMultiplayerGameContent />
    </ProtectedRoute>
  );
}