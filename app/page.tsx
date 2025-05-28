'use client';

import { useState } from 'react';

type Player = 'X' | 'O' | null;

const winningCombos = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left col
  [1, 4, 7], // mid col
  [2, 5, 8], // right col
  [0, 4, 8], // diagonal
  [2, 4, 6], // diagonal
];

const getWinner = (board: Player[]) => {
  for (const [a, b, c] of winningCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
};

const TicTacToe = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const { winner, line } = getWinner(board);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const renderSquare = (index: number) => (
    <button
      key={index}
      onClick={() => handleClick(index)}
      className="w-24 h-24 text-3xl font-bold border border-gray-400 flex items-center justify-center"
      style={{
        color:
          board[index] === 'X'
            ? '#fca5a5' // pastel red
            : board[index] === 'O'
            ? '#93c5fd' // pastel blue
            : 'black',
      }}
    >
      {board[index]}
    </button>
  );

  const getLineStyle = (line: number[] | null) => {
    if (!line) return {};

    const color = board[line[0]] === 'X' ? '#fca5a5' : '#93c5fd';
    const positionStyles = [
      // horizontal lines
      { top: '12%', left: '0', width: '100%', height: '4px' },
      { top: '46%', left: '0', width: '100%', height: '4px' },
      { top: '81%', left: '0', width: '100%', height: '4px' },
      // vertical lines
      { left: '12%', top: '0', height: '100%', width: '4px' },
      { left: '46%', top: '0', height: '100%', width: '4px' },
      { left: '81%', top: '0', height: '100%', width: '4px' },
      // diagonals
      {
        top: '0',
        left: '0',
        width: '100%',
        height: '4px',
        transform: 'rotate(45deg)',
        transformOrigin: 'top left',
      },
      {
        top: '0',
        left: '0',
        width: '100%',
        height: '4px',
        transform: 'rotate(-45deg)',
        transformOrigin: 'top right',
      },
    ];
    const index = winningCombos.findIndex(
      (combo) => combo.join() === line.join()
    );
    return {
      ...positionStyles[index],
      backgroundColor: color,
      position: 'absolute',
      zIndex: 10,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Tic Tac Toe</h1>
      <div className="relative" style={{ width: '288px', height: '288px' }}>
        {line && <div style={getLineStyle(line)} />}
        <div className="grid grid-cols-3 gap-1 w-full h-full">
          {board.map((_, index) => renderSquare(index))}
        </div>
      </div>
      <p className="mt-4 text-lg">
        {winner
          ? `Winner: ${winner}`
          : board.includes(null)
          ? `Next Player: ${isXNext ? 'X' : 'O'}`
          : 'Draw!'}
      </p>
    </div>
  );
};

export default TicTacToe;
