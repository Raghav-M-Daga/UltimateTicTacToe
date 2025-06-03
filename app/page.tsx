'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Types
type Player = 'X' | 'O' | null;
type MiniBoardState = Player[];
type BoardState = MiniBoardState[];

// Helpers
const emptyMiniBoard = (): MiniBoardState => Array(9).fill(null);

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinner = (cells: Player[]): { winner: Player; line: number[] } | null => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line: combo };
    }
  }
  return null;
};

// Strategic AI logic
const getStrongMove = (
  miniBoard: MiniBoardState,
  miniIndex: number,
  board: BoardState,
  miniWinners: (Player | null)[]
): number => {
  const opponent: Player = 'X';
  const self: Player = 'O';

  const isMiniBoardWinnable = (mini: MiniBoardState, player: Player): boolean => {
    return winningCombos.some(combo => {
      const [a, b, c] = combo;
      const line = [mini[a], mini[b], mini[c]];
      return line.filter(p => p === player).length === 2 && line.includes(null);
    });
  };

  const isFavorableMiniBoard = (index: number, miniWinners: (Player | null)[], player: Player): boolean => {
    return winningCombos.some(combo => {
      const [a, b, c] = combo;
      const values = [a, b, c].map(i => miniWinners[i]);
      return values.filter(p => p === player).length === 2 && values.includes(null) && combo.includes(index);
    });
  };

  const isSequencePossible = (mini: MiniBoardState, player: Player): boolean => {
    return winningCombos.some(([a, b, c]) => {
      const line = [mini[a], mini[b], mini[c]];
      return line.filter(cell => cell === player || cell === null).length === 3;
    });
  };

  const isTargetSafeForOpponent = (targetMini: number): boolean => {
    return !miniWinners[targetMini] && !board[targetMini].every(c => c !== null)
      && !isMiniBoardWinnable(board[targetMini], opponent)
      && !isFavorableMiniBoard(targetMini, miniWinners, opponent)
      && !isSequencePossible(board[targetMini], opponent);
  };

  const getMovePriority = (idx: number): number => {
  const newMiniBoard = [...miniBoard];
  newMiniBoard[idx] = self;
  const targetMini = idx;

  const opponentTargetBoard = board[targetMini];
  const opponentCanWinTarget = isMiniBoardWinnable(opponentTargetBoard, opponent);
  const opponentSequencePossible = isSequencePossible(opponentTargetBoard, opponent);
  const opponentFavorable = isFavorableMiniBoard(targetMini, miniWinners, opponent);
  const safeTarget = isTargetSafeForOpponent(targetMini);

  // 1. Try to win this mini-board
  if (checkWinner(newMiniBoard)?.winner === self) {
    if (!opponentCanWinTarget && !opponentFavorable) {
      return 100; // Safe mini-board win
    } else if (!opponentFavorable && opponentSequencePossible) {
      return 75; // Acceptable trade: we win a board, opponent can build
    } else {
      return 30; // Risky win, might give more to opponent
    }
  }

  // 2. Block opponent win in this mini-board
  const testBlock = [...miniBoard];
  testBlock[idx] = opponent;
  if (checkWinner(testBlock)?.winner === opponent) {
    if (!opponentCanWinTarget && !opponentFavorable) {
      return 90; // Safe block
    } else {
      return 40; // Risky block (may give opponent good board)
    }
  }

  // 3. Build own sequence while keeping opponent in bad spot
  if (isSequencePossible(miniBoard, self)) {
    if (safeTarget) return 60; // Good positioning
    if (!opponentCanWinTarget && !opponentFavorable) return 50; // Mild risk, good setup
  }

  // 4. Avoid risky placements entirely
  if (safeTarget) return 45;

  return 10; // fallback: weak move
};


  const viableMoves = miniBoard
    .map((cell, idx) => (cell === null ? { idx, priority: getMovePriority(idx) } : null))
    .filter(Boolean) as { idx: number; priority: number }[];

  viableMoves.sort((a, b) => b.priority - a.priority);
  return viableMoves.length > 0 ? viableMoves[0].idx : miniBoard.findIndex(c => c === null);
};

// Main component
const UltimateTicTacToe = () => {
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null).map(() => emptyMiniBoard()));
  const [miniWinners, setMiniWinners] = useState<(Player | null)[]>(Array(9).fill(null));
  const [winLines, setWinLines] = useState<(number[] | null)[]>(Array(9).fill(null));
  const [activeMiniBoard, setActiveMiniBoard] = useState<number | null>(null);
  const [isXNext, setIsXNext] = useState(true);
  const [gameWinner, setGameWinner] = useState<Player>(null);
  const [gameLine, setGameLine] = useState<number[] | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [invalidMoveMessage, setInvalidMoveMessage] = useState<string>('');

  const handleClick = (miniIndex: number, cellIndex: number) => {
    setInvalidMoveMessage('');

    if (gameWinner || miniWinners[miniIndex]) return;
    if (activeMiniBoard !== null && miniIndex !== activeMiniBoard) {
      setInvalidMoveMessage(`Play must be in board ${activeMiniBoard + 1}`);
      return;
    }

    const newBoard = board.map((mini, i) => [...mini]);
    if (newBoard[miniIndex][cellIndex]) return;

    const historyState = {
      board: board.map(m => [...m]),
      miniWinners: [...miniWinners],
      winLines: [...winLines],
      activeMiniBoard,
      isXNext,
      gameWinner,
      gameLine,
    };
    setHistory(prev => [...prev, historyState]);

    newBoard[miniIndex][cellIndex] = isXNext ? 'X' : 'O';

    const miniResult = checkWinner(newBoard[miniIndex]);
    const updatedMiniWinners = [...miniWinners];
    const updatedWinLines = [...winLines];

    if (miniResult) {
      updatedMiniWinners[miniIndex] = miniResult.winner;
      updatedWinLines[miniIndex] = miniResult.line;
    }

    const gameResult = checkWinner(updatedMiniWinners);
    setBoard(newBoard);
    setMiniWinners(updatedMiniWinners);
    setWinLines(updatedWinLines);
    setGameWinner(gameResult?.winner || null);
    setGameLine(gameResult?.line || null);
    setIsXNext(!isXNext);

    const nextMini =
      updatedMiniWinners[cellIndex] || newBoard[cellIndex].every(c => c !== null)
        ? null
        : cellIndex;
    setActiveMiniBoard(nextMini);
  };

  const aiMove = () => {
    if (mode !== 'single' || gameWinner || isXNext) return;

    const targetMini =
      activeMiniBoard === null || miniWinners[activeMiniBoard] || board[activeMiniBoard].every(c => c !== null)
        ? board.findIndex((mini, i) => !miniWinners[i] && mini.includes(null))
        : activeMiniBoard;

    if (targetMini === -1) return;

    const moveIndex = getStrongMove(board[targetMini], targetMini, board, miniWinners);
    if (moveIndex !== undefined && moveIndex !== -1) handleClick(targetMini, moveIndex);
  };

  useEffect(() => {
    if (!isXNext && mode === 'single') {
      const timeout = setTimeout(() => aiMove(), 500);
      return () => clearTimeout(timeout);
    }
  }, [isXNext, mode]);

  const resetGame = () => {
    setBoard(Array(9).fill(null).map(() => emptyMiniBoard()));
    setMiniWinners(Array(9).fill(null));
    setWinLines(Array(9).fill(null));
    setGameWinner(null);
    setGameLine(null);
    setIsXNext(true);
    setActiveMiniBoard(null);
    setHistory([]);
    setInvalidMoveMessage('');
  };

  const undoMove = () => {
    const last = history.pop();
    if (last) {
      setBoard(last.board);
      setMiniWinners(last.miniWinners);
      setWinLines(last.winLines);
      setActiveMiniBoard(last.activeMiniBoard);
      setIsXNext(last.isXNext);
      setGameWinner(last.gameWinner);
      setGameLine(last.gameLine);
      setHistory([...history]);
      setInvalidMoveMessage('');
    }
  };

  const getCellColor = (cell: Player): string => {
    return cell === 'X' ? '#fca5a5' : cell === 'O' ? '#93c5fd' : 'white';
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-3xl font-bold">Choose Game Mode</h1>
        <button
          onClick={() => setMode('single')}
          className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-300"
        >
          Single Player
        </button>
        <button
          onClick={() => setMode('multi')}
          className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-300"
        >
          Multiplayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold mb-2">Ultimate Tic Tac Toe</h1>
      <div className="relative grid grid-cols-3 gap-2">
        {board.map((mini, miniIndex) => (
          <div
            key={miniIndex}
            className={`relative grid grid-cols-3 gap-[1px] p-[2px] border-2 transition-all duration-200 ${
              miniWinners[miniIndex]
                ? 'border-transparent opacity-70'
                : activeMiniBoard === null || activeMiniBoard === miniIndex
                ? 'border-white shadow-[0_0_0_3px_#93c5fd]'
                : 'border-gray-600 opacity-50'
            }`}
          >
            {mini.map((cell, cellIndex) => {
              const isWinLine = winLines[miniIndex]?.includes(cellIndex);
              return (
                <motion.button
                  key={cellIndex}
                  onClick={() => handleClick(miniIndex, cellIndex)}
                  className={`w-10 h-10 text-xl font-bold border border-gray-500 flex items-center justify-center transition-all duration-150 ${
                    isWinLine ? 'bg-opacity-50 bg-current' : ''
                  }`}
                  style={{
                    color: getCellColor(cell),
                    backgroundColor: isWinLine ? getCellColor(cell) : 'transparent',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {cell}
                </motion.button>
              );
            })}
            {miniWinners[miniIndex] && (
              <div
                className="absolute inset-0 flex items-center justify-center text-[5rem] font-extrabold opacity-40 pointer-events-none"
                style={{ color: getCellColor(miniWinners[miniIndex]) }}
              >
                {miniWinners[miniIndex]}
              </div>
            )}
          </div>
        ))}
        {gameLine && (
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {(() => {
                const positions = [
                  [50, 50], [150, 50], [250, 50],
                  [50, 150], [150, 150], [250, 150],
                  [50, 250], [150, 250], [250, 250],
                ];
                const [start, end] = [positions[gameLine[0]], positions[gameLine[2]]];
                return (
                  <line
                    x1={start[0]}
                    y1={start[1]}
                    x2={end[0]}
                    y2={end[1]}
                    stroke={getCellColor(gameWinner)}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                );
              })()}
            </svg>
          </div>
        )}
      </div>

      <p className="text-lg">
        {gameWinner
          ? `🏆 Winner: ${gameWinner}`
          : `Next: ${isXNext ? 'X' : 'O'} ${
              activeMiniBoard !== null
                ? `(Play in board ${activeMiniBoard + 1})`
                : '(Play anywhere)'
            }`}
      </p>

      {invalidMoveMessage && (
        <p className="text-red-400 font-medium transition-opacity duration-300 animate-pulse">
          ⚠️ {invalidMoveMessage}
        </p>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={resetGame}
          className="mt-2 px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 transition"
        >
          Reset Game
        </button>
        <button
          onClick={undoMove}
          disabled={history.length === 0}
          className="mt-2 px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Undo
        </button>
        <button
          onClick={() => setMode(null)}
          className="mt-2 px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 transition"
        >
          Back to Mode Select
        </button>
      </div>
    </div>
  );
};

export default UltimateTicTacToe;
