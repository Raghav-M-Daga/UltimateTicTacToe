'use client';

import { useRouter } from 'next/navigation';
import UltimateTicTacToe from '../../components/UltimateTicTacToe';

export default function LocalMultiplayerGame() {
  const router = useRouter();

  return (
    <UltimateTicTacToe 
      mode="multi" 
      onBack={() => router.push('/games')} 
    />
  );
} 