'use client';

import { useRouter } from 'next/navigation';
import UltimateTicTacToe from '../../components/UltimateTicTacToe';

export default function SinglePlayerGame() {
  const router = useRouter();

  return (
    <UltimateTicTacToe 
      mode="single" 
      onBack={() => router.push('/games')} 
    />
  );
} 