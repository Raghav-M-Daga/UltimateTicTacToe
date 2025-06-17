'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebaseConfig';
import { getDatabase, ref, set, get, remove, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';

// Types
type Player = 'X' | 'O' | null;
type MiniBoardState = Player[];
type BoardState = MiniBoardState[];
type GameMode = 'single' | 'multi' | 'online' | null;

// Helpers
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

const checkMiniWinner = (cells: Player[]): { winner: Player; line: number[] } | null => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      if (cells[a] !== null) {
        return { winner: cells[a], line: combo };
      }
    }
  }
  return null;
};

const checkMainBoardWinner = (miniWinners: (Player | null)[]): { winner: Player; line: number[] } | null => {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (miniWinners[a] && miniWinners[a] === miniWinners[b] && miniWinners[a] === miniWinners[c]) {
      if (miniWinners[a] !== null) {
        return { winner: miniWinners[a], line: combo };
      }
    }
  }
  return null;
};

// Improved AI: Avoid sending opponent to dangerous boards
const getStrongMove = (
  miniBoard: MiniBoardState,
  miniIndex: number,
  board: BoardState,
  miniWinners: (Player | null)[]
): number => {
  const opponent: Player = 'X';
  const self: Player = 'O';

  // Helper: is dangerous to send opponent to this mini-board?
  function isDangerousBoard(idx: number): boolean {
    if (miniWinners[idx]) return true; // already won
    const oppBoard = board[idx];
    // Opponent can win next move?
    for (let i = 0; i < 9; i++) {
      if (oppBoard[i] === null) {
        const temp = [...oppBoard];
        temp[i] = opponent;
        if (checkMiniWinner(temp)?.winner === opponent) return true;
      }
    }
    // Opponent can block a fork/critical square for AI?
    for (let i = 0; i < 9; i++) {
      if (oppBoard[i] === null) {
        const temp = [...oppBoard];
        temp[i] = self;
        if (checkMiniWinner(temp)?.winner === self) return false; // AI could win, not dangerous
      }
    }
    return false;
  }

  // 1. Win if possible
  for (let i = 0; i < 9; i++) {
    if (miniBoard[i] === null) {
      const temp = [...miniBoard];
      temp[i] = self;
      if (checkMiniWinner(temp)?.winner === self) return i;
    }
  }
  // 2. Block opponent win
  for (let i = 0; i < 9; i++) {
    if (miniBoard[i] === null) {
      const temp = [...miniBoard];
      temp[i] = opponent;
      if (checkMiniWinner(temp)?.winner === opponent) return i;
    }
  }
  // 3. Prefer moves that send opponent to a safe board
  const safeMoves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (miniBoard[i] === null) {
      if (!isDangerousBoard(i)) safeMoves.push(i);
    }
  }
  if (safeMoves.length > 0) {
    // Prefer center, then corners, then sides
    if (safeMoves.includes(4)) return 4;
    const corners = [0, 2, 6, 8].filter(idx => safeMoves.includes(idx));
    if (corners.length > 0) return corners[0];
    return safeMoves[0];
  }
  // 4. Fallback: play center, then corners, then sides
  if (miniBoard[4] === null) return 4;
  const corners = [0, 2, 6, 8];
  for (const idx of corners) {
    if (miniBoard[idx] === null) return idx;
  }
  const sides = [1, 3, 5, 7];
  for (const idx of sides) {
    if (miniBoard[idx] === null) return idx;
  }
  // 5. Fallback: first available
  return miniBoard.findIndex(c => c === null);
};

// Helper to check if a mini-board is full
const isMiniBoardFull = (mini: MiniBoardState) => mini.every(cell => cell !== null);

// Helper to convert board object to array for rendering
function boardObjToArr(boardObj: Record<string, Record<string, Player>>): Player[][] {
  return Object.keys(boardObj)
    .sort((a, b) => Number(a) - Number(b))
    .map(i => {
      const mini = boardObj[i];
      return Object.keys(mini)
        .sort((a, b) => Number(a) - Number(b))
        .map(j => mini[j]);
    });
}

// Helper to convert miniWinners object to array
function miniWinnersObjToArr(miniObj: Record<string, Player | null>): (Player | null)[] {
  return Object.keys(miniObj)
    .sort((a, b) => Number(a) - Number(b))
    .map(i => miniObj[i]);
}

// Hardcoded initial board and miniWinners objects
const initialBoard = {
  "0": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "1": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "2": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "3": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "4": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "5": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "6": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "7": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null },
  "8": { "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null }
};
const initialMiniWinners = {
  "0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null
};

interface UltimateTicTacToeProps {
  mode: GameMode;
  onBack?: () => void;
}

function boardArrToObj(boardArr: BoardState): Record<string, Record<string, Player>> {
  const obj: Record<string, Record<string, Player>> = {};
  boardArr.forEach((mini, i) => {
    obj[i] = {};
    mini.forEach((cell, j) => {
      obj[i][j] = cell;
    });
  });
  return obj;
}

export default function UltimateTicTacToe({ mode, onBack }: UltimateTicTacToeProps) {
  const [gameState, setGameState] = useState<BoardState>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );  
  const [activeBoard, setActiveBoard] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<{ winner: Player; line: number[] } | null>(null);
  const [gameId, setGameId] = useState<string>('');
  const [isPlayerX, setIsPlayerX] = useState<boolean | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ board: number; cell: number }>>([]);
  const [miniWinners, setMiniWinners] = useState<(Player | null)[]>(Array(9).fill(null));
  const [joinGameId, setJoinGameId] = useState('');
  const router = useRouter();
  const isLeavingRef = useRef(false);
  const gameStatusRef = useRef<'waiting' | 'playing'>('waiting');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing'>('waiting');
  const [showStartAlert, setShowStartAlert] = useState(false);

  const handleLocalMove = useCallback((boardIndex: number, cellIndex: number): void => {
    console.log(`Cell clicked: miniBoard ${boardIndex}, cell ${cellIndex}`);
    if (winner || (activeBoard !== null && activeBoard !== boardIndex && (!miniWinners[activeBoard] && !isMiniBoardFull(gameState[activeBoard])))) return;
    const newGameState = [...gameState];
    newGameState[boardIndex] = [...newGameState[boardIndex]];
    newGameState[boardIndex][cellIndex] = currentPlayer;
    const miniWinner = checkMiniWinner(newGameState[boardIndex]);
    const newMiniWinners = [...miniWinners];
    if (miniWinner && !newMiniWinners[boardIndex]) {
      newMiniWinners[boardIndex] = miniWinner.winner;
    }
    setGameState(newGameState);
    setMiniWinners(newMiniWinners);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    setMoveHistory([...moveHistory, { board: boardIndex, cell: cellIndex }]);
    let nextActive: number | null = cellIndex;
    if (
      typeof nextActive === 'number' &&
      (newMiniWinners[nextActive] || isMiniBoardFull(newGameState[nextActive]))
    ) {
      nextActive = null;
    }
    setActiveBoard(nextActive);
    const mainWinner = checkMainBoardWinner(newMiniWinners);
    if (mainWinner) {
      setWinner(mainWinner);
    }
  }, [winner, activeBoard, miniWinners, gameState, currentPlayer, moveHistory]);

  useEffect(() => {
    if (mode === 'single' && currentPlayer === 'O' && !winner) {
      let boardToPlay = activeBoard;
      if (boardToPlay === null || miniWinners[boardToPlay]) {
        const availableBoards = gameState
          .map((mini, idx) => (miniWinners[idx] === null && mini.includes(null) ? idx : null))
          .filter(idx => idx !== null) as number[];
        boardToPlay = availableBoards.length > 0 ? availableBoards[0] : null;
      }
      if (boardToPlay === null) return;
      const move = getStrongMove(gameState[boardToPlay], boardToPlay, gameState, miniWinners);
      if (move !== -1 && gameState[boardToPlay][move] === null) {
        setTimeout(() => {
          handleLocalMove(boardToPlay!, move);
        }, 500);
      }
    }
  }, [mode, currentPlayer, winner, activeBoard, gameState, miniWinners, handleLocalMove]);

  // Warn on navigation away for single/local modes
  useEffect(() => {
    if (mode === 'single' || mode === 'multi') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!isLeavingRef.current) {
          e.preventDefault();
          e.returnValue = 'Are you sure you want to leave? Your game will not be saved.';
          return e.returnValue;
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'online' && !gameId) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (id) {
        setGameId(id);
        joinGame(id);
      }
    }
  }, [mode, gameId]);

  // Real-time sync for online games
  useEffect(() => {
    if (mode === 'online' && gameId) {
      const db = getDatabase();
      const gameRef = ref(db, `games/${gameId}`);
      
      console.log('Setting up real-time listener for game:', gameId);
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          console.log('No game data received');
          return;
        }

        console.log('Received game update:', JSON.stringify(data, null, 2));

        try {
          // Defensive: Initialize board if missing
          if (!data.board) {
            console.log('Initializing missing board');
            const updatedData = {
              ...data,
              board: initialBoard,
              miniWinners: initialMiniWinners,
              boardArray: Array(9).fill(Array(9).fill(0)),
              miniWinnersArray: [0, 0, 0, 0, 0, 0, 0, 0, 0],
              test: [0, 0, 0, 0, 0],
              status: data.players && data.players.O ? 'playing' : 'waiting'
            };
            set(gameRef, JSON.parse(JSON.stringify(updatedData)))
              .then(() => console.log('Board initialized in database'))
              .catch((err) => console.error('Failed to initialize board in database', err));
            // Do NOT update local state here. Wait for the next real-time update.
            return;
          }

          // Always set gameStatus to 'playing' if both players are present
          let status = data.status;
          if (data.players && data.players.X && data.players.O) {
            status = 'playing';
          }
          setGameStatus(status);
          gameStatusRef.current = status;

          // Convert board and miniWinners objects to arrays for rendering
          const safeBoard = boardObjToArr(data.board);
          setGameState(safeBoard);
          setMiniWinners(miniWinnersObjToArr(data.miniWinners));
          setCurrentPlayer(data.currentPlayer || 'X');
          setActiveBoard(data.activeBoard);
          setWinner(data.winner || null);
          console.log('Local state updated from real-time update. Current board:', safeBoard);

          // Set isPlayerX based on auth
          const myUid = auth.currentUser?.uid;
          if (myUid) {
            setIsPlayerX(data.players?.X === myUid);
          }

          // Show start alert when game begins
          if (status === 'playing' && gameStatusRef.current === 'waiting') {
            console.log('Game is starting!');
            setShowStartAlert(true);
            setTimeout(() => setShowStartAlert(false), 2000);
          }
        } catch (error) {
          console.error('Error updating game state:', error);
        }
      });

      return () => {
        console.log('Cleaning up real-time listener');
        unsubscribe();
      };
    }
  }, [mode, gameId, gameStatus]);

  const createGame = async (): Promise<void> => {
    try {
      const db = getDatabase();
      const newGameId = Math.floor(100000 + Math.random() * 900000).toString();
      if (!newGameId) throw new Error('Failed to create game');

      // Use hardcoded initialBoard and initialMiniWinners
      const initialGameState = {
        board: initialBoard,
        currentPlayer: 'X',
        activeBoard: null,
        winner: null,
        players: {
          X: auth.currentUser?.uid,
          O: null
        },
        status: 'waiting',
        miniWinners: initialMiniWinners,
        lastMove: null,
        createdAt: Date.now(),
        test: [0, 0, 0, 0, 0],
        miniWinnersArray: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        boardArray: Array(9).fill(Array(9).fill(0))
      };

      console.log('Creating new game with state:', JSON.stringify(initialGameState, null, 2));
      
      // Create the game in Firebase
      const gameRef = ref(db, `games/${newGameId}`);
      await set(gameRef, JSON.parse(JSON.stringify(initialGameState)))
        .then(() => console.log('Game created in DB:', initialGameState))
        .catch((err) => console.error('Failed to create game in DB', err));
      
      // Set local state and route. Real-time listener will update UI when board is available.
      setGameId(newGameId);
      setIsPlayerX(true);
      setGameStatus('waiting');
      setGameState(boardObjToArr(initialBoard));
      setMiniWinners(miniWinnersObjToArr(initialMiniWinners));
      setCurrentPlayer('X');
      setActiveBoard(null);
      setWinner(null);
      
      router.push(`/games/online?id=${newGameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      alert('Failed to create game. Please try again.');
    }
  };

  const joinGame = async (id: string): Promise<void> => {
    try {
      const db = getDatabase();
      const gameRef = ref(db, `games/${id}`);
      let snapshot = await get(gameRef);
      if (!snapshot.exists()) {
        throw new Error('Game not found');
      }
      let gameData = snapshot.val();
      const myUid = auth.currentUser?.uid;
      if (!myUid) throw new Error('Not authenticated');

      // Check if player is already in the game
      if (gameData.players.X === myUid || gameData.players.O === myUid) {
        setGameId(id);
        setIsPlayerX(gameData.players.X === myUid);
        setGameStatus(gameData.status);
        return;
      }

      // Check if game is full
      if (gameData.players.O) {
        throw new Error('Game is full');
      }

      // Initialize board if it doesn't exist
      if (!gameData.board) {
        gameData.board = initialBoard;
        await set(gameRef, JSON.parse(JSON.stringify({
          ...gameData,
          board: gameData.board,
          miniWinners: initialMiniWinners,
        }))); // Wait for the board to exist
        // Wait for the board to exist
        let tries = 0;
        while ((!gameData || !gameData.board) && tries < 5) {
          await new Promise(res => setTimeout(res, 200));
          snapshot = await get(gameRef);
          gameData = snapshot.val();
          tries++;
        }
        if (!gameData || !gameData.board) {
          throw new Error('Failed to join game - board not initialized');
        }
      }

      // Join as player O
      const updatedGameData = {
        ...gameData,
        board: gameData.board,
        players: {
          ...gameData.players,
          O: myUid
        },
        status: 'playing',
        miniWinners: gameData.miniWinners || initialMiniWinners,
        lastMove: gameData.lastMove || null,
        currentPlayer: 'X' // Ensure X starts
      };

      console.log('Joining game with data:', JSON.stringify(updatedGameData, null, 2));
      await set(gameRef, JSON.parse(JSON.stringify(updatedGameData)));

      // Update local state
      setGameId(id);
      setIsPlayerX(false);
      setGameStatus('playing');
      setGameState(boardObjToArr(updatedGameData.board));
      setMiniWinners(miniWinnersObjToArr(updatedGameData.miniWinners));
      setCurrentPlayer('X');
      setActiveBoard(null);
      setWinner(null);
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
    }
  }; 

  const handleClick = (boardIndex: number, cellIndex: number): void => {
    console.log(`Cell clicked: miniBoard ${boardIndex}, cell ${cellIndex}`);
    if (winner) return;
    // Convert miniWinners to array format for comparison
    const miniWinnersArray = miniWinners.map(w => w === 'X' ? 1 : w === 'O' ? 2 : 0);
    if (miniWinnersArray[boardIndex] !== 0) return; // Prevent moves in won mini-boards

    // Enforce forced mini-board logic for local/single modes
    if ((mode === 'single' || mode === 'multi')) {
      if (activeBoard !== null && activeBoard !== boardIndex) {
        // If forced board is not the one being played, check if forced board is won or full
        if (miniWinnersArray[activeBoard] === 0 && !isMiniBoardFull(gameState[activeBoard])) {
          return; // Not allowed to play here
        }
      }
    }

    if (mode === 'online') {
      handleOnlineMove(boardIndex, cellIndex);
    } else {
      handleLocalMove(boardIndex, cellIndex);
    }
  };

  const handleOnlineMove = async (boardIndex: number, cellIndex: number): Promise<void> => {
    if (!gameId || isPlayerX === null) {
      console.log('Move not allowed: missing gameId or isPlayerX');
      return;
    }
    try {
      const db = getDatabase();
      const gameRef = ref(db, `games/${gameId}`);
      const snapshot = await get(gameRef);
      if (!snapshot.exists()) {
        console.log('Move not allowed: game does not exist');
        return;
      }
      const gameData = snapshot.val();
      if (!gameData.boardArray) {
        alert('The board is not ready yet. Please wait a moment and try again.');
        console.log('Move not allowed: board missing');
        return;
      }
      if (gameData.status !== 'playing') {
        console.log('Move not allowed: game not in playing state');
        return;
      }
      const isMyTurn = (isPlayerX && gameData.currentPlayer === 'X') || (!isPlayerX && gameData.currentPlayer === 'O');
      if (!isMyTurn) {
        console.log('Move not allowed: not your turn');
        return;
      }
      if (gameData.boardArray[boardIndex][cellIndex] !== 0) {
        console.log('Move not allowed: cell already filled');
        return;
      }

      // Update boardArray
      const newBoardArray = JSON.parse(JSON.stringify(gameData.boardArray));
      newBoardArray[boardIndex] = [...newBoardArray[boardIndex]];
      newBoardArray[boardIndex][cellIndex] = gameData.currentPlayer === 'X' ? 1 : 2;

      // Check for mini board winner
      const newMiniWinnersArray = [...gameData.miniWinnersArray];
      const miniWinner = checkMiniWinner(newBoardArray[boardIndex].map((cell: number) => cell === 1 ? 'X' : cell === 2 ? 'O' : null));
      if (miniWinner) {
        newMiniWinnersArray[boardIndex] = miniWinner.winner === 'X' ? 1 : 2;
      }

      // Check for main board winner
      const mainWinner = checkMainBoardWinner(newMiniWinnersArray.map((cell: number) => cell === 1 ? 'X' : cell === 2 ? 'O' : null));
      let nextActiveBoard: number | null = cellIndex;
      if (newMiniWinnersArray[cellIndex] !== 0 || isMiniBoardFull(newBoardArray[cellIndex].map((cell: number) => cell === 1 ? 'X' : cell === 2 ? 'O' : null))) {
        nextActiveBoard = null;
      }

      // Create the update data
      const gameUpdate = {
        ...gameData,
        currentPlayer: gameData.currentPlayer === 'X' ? 'O' : 'X',
        activeBoard: nextActiveBoard,
        winner: mainWinner,
        boardArray: newBoardArray,
        miniWinnersArray: newMiniWinnersArray,
        test: gameData.test,
        lastMove: {
          board: boardIndex,
          cell: cellIndex,
          player: gameData.currentPlayer,
          timestamp: Date.now()
        }
      };

      console.log('Saving move to database:', gameUpdate);
      await set(gameRef, gameUpdate);
      console.log('Move saved successfully');
    } catch (error) {
      console.error('Error making move:', error);
      alert('Failed to make move. Please try again.');
    }
  };

  const resetGame = (): void => {
    setGameState(Array(9).fill(Array(9).fill(null)));
    setMiniWinners(Array(9).fill(null));
    setActiveBoard(null);
    setCurrentPlayer('X');
    setWinner(null);
    setMoveHistory([]);
  };

  const undoMove = (): void => {
    if (moveHistory.length === 0) return;

    const newMoveHistory = [...moveHistory];
    const lastMove = newMoveHistory.pop();
    if (!lastMove) return;

    const newGameState = [...gameState];
    newGameState[lastMove.board] = [...newGameState[lastMove.board]];
    newGameState[lastMove.board][lastMove.cell] = null;

    setGameState(newGameState);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X'); 
    setActiveBoard(lastMove.board);
    setMoveHistory(newMoveHistory);
    setWinner(null);
  };

  const getCellColor = (cell: Player): string => {
    return cell === 'X' ? '#fca5a5' : cell === 'O' ? '#93c5fd' : 'white';
  };

  // Update onBack to warn before leaving only if game is not complete
  const handleBack = () => {
    if ((mode === 'single' || mode === 'multi') && !isLeavingRef.current && !winner) {
      const confirmLeave = window.confirm('Are you sure you want to leave? Your game will not be saved.');
      if (!confirmLeave) return;
      isLeavingRef.current = true;
    }
    if (onBack) onBack();
  };

  // Before rendering the board, check if the board is ready
  const isBoardReady =
    Array.isArray(gameState) &&
    gameState.length === 9 &&
    gameState.every(mini => Array.isArray(mini) && mini.length === 9);

  if (mode === 'online' && !gameId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-3xl font-bold">Online Multiplayer</h1>
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={createGame}
            className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-300 w-48"
          >
            Create Game
          </button>
          <div className="flex flex-col gap-2 items-center">
            <input
              type="text"
              value={joinGameId}
              onChange={(e) => setJoinGameId(e.target.value)}
              placeholder="Enter game ID"
              className="px-4 py-2 rounded text-black w-48 border border-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}
              maxLength={6}
              autoComplete="off"
            />
            <button
              onClick={async () => {
                if (joinGameId) {
                  try {
                    await joinGame(joinGameId);
                  } catch {
                    // Optionally handle error
                  }
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 w-48 transition-colors"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'online' && (gameStatus === 'waiting' || !gameStatus) && !(gameState && gameState.length === 9 && isPlayerX !== null)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-3xl font-bold">Waiting for opponent...</h1>
        <p className="text-lg">Share this game ID with your opponent: {gameId}</p>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">Game Status:</p>
          <p className="text-lg">Waiting for opponent to join</p>
          <p className="text-sm text-gray-400 mt-2">You are playing as: <span className="text-red-500">X</span></p>
        </div>
        <button
          onClick={() => {
            if (gameId) {
              const db = getDatabase();
              remove(ref(db, `games/${gameId}`));
            }
            setGameId('');
            if (onBack) onBack();
          }}
          className="mt-4 px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (mode === 'online' && gameStatus === 'playing' && !isBoardReady) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-3xl font-bold">Preparing board...</h1>
        <p className="text-lg">Please wait, setting up the game board...</p>
      </div>
    );
  }

  // In the render, log the current gameState structure
  console.log('Rendering UltimateTicTacToe, current gameState:', gameState);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4 relative">
      {/* Game ID in top right corner */}
      {mode === 'online' && (
        <div className="absolute top-4 right-4 bg-gray-800 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-400">Game ID</p>
          <p className="text-xl font-mono font-bold">{gameId}</p>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">Ultimate Tic Tac Toe</h1>

      {/* Player and Game Status */}
      {mode === 'online' && (
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`px-6 py-3 rounded-lg ${isPlayerX ? 'bg-red-500/20 border-2 border-red-500' : 'bg-gray-800'}`}>
              <p className="text-sm text-gray-400">You are</p>
              <p className={`text-2xl font-bold ${isPlayerX ? 'text-red-500' : 'text-blue-500'}`}>
                {isPlayerX ? 'X' : 'O'}
              </p>
            </div>
            <div className="px-6 py-3 rounded-lg bg-gray-800">
              <p className="text-sm text-gray-400">Opponent is</p>
              <p className={`text-2xl font-bold ${isPlayerX ? 'text-blue-500' : 'text-red-500'}`}>
                {isPlayerX ? 'O' : 'X'}
              </p>
            </div>
          </div>

          {gameStatus === 'playing' && (
            <div className={`px-6 py-3 rounded-lg ${
              currentPlayer === (isPlayerX ? 'X' : 'O')
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-yellow-500/20 border-2 border-yellow-500'
            }`}>
              {currentPlayer === (isPlayerX ? 'X' : 'O') ? (
                <p className="text-xl font-bold text-green-400">
                  {isPlayerX && moveHistory.length === 0 
                    ? "It's your turn! Make your first move anywhere on the board."
                    : "It's your turn! Make your move."}
                </p>
              ) : (
                <p className="text-xl font-bold text-yellow-400">
                  Waiting for opponent&apos;s move...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative grid grid-cols-3 gap-2">
        {winner && winner.line && (
          <svg
            className="absolute left-0 top-0 w-full h-full pointer-events-none z-20"
            style={{ width: '100%', height: '100%' }}
          >
            {(() => {
              const centers = [
                [1 / 6, 1 / 6], [1 / 2, 1 / 6], [5 / 6, 1 / 6],
                [1 / 6, 1 / 2], [1 / 2, 1 / 2], [5 / 6, 1 / 2],
                [1 / 6, 5 / 6], [1 / 2, 5 / 6], [5 / 6, 5 / 6],
              ];
              const [a, , c] = winner.line;
              const [x1, y1] = centers[a];
              const [x2, y2] = centers[c];
              return (
                <line
                  x1={`${x1 * 100}%`} y1={`${y1 * 100}%`}
                  x2={`${x2 * 100}%`} y2={`${y2 * 100}%`}
                  stroke={getCellColor(winner.winner)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              );
            })()}
          </svg>
        )}
        {gameState.map((mini, miniIndex) => {
          const boardWinner = miniWinners[miniIndex];
          const miniWin = boardWinner && checkMiniWinner(mini);
          const winLine = miniWin ? miniWin.line : [];
          const isActive = activeBoard === null || activeBoard === miniIndex;
          const isFirstMove = moveHistory.length === 0 && isPlayerX && currentPlayer === 'X';
          
          return (
            <div
              key={miniIndex}
              className={`relative grid grid-cols-3 gap-[1px] p-[2px] border-2 transition-all duration-200 ${
                winner && winner.winner === miniWinners[miniIndex]
                  ? 'border-transparent opacity-70'
                  : isActive || isFirstMove
                  ? 'border-white shadow-[0_0_0_3px_#93c5fd]'
                  : 'border-gray-600 opacity-50'
              }`}
              style={{
                backgroundColor: boardWinner === 'X'
                  ? 'rgba(252,165,165,0.45)'
                  : boardWinner === 'O'
                  ? 'rgba(147,197,253,0.45)'
                  : 'transparent',
              }}
            >
              {mini.map((cell, cellIndex) => {
                const isWinLine = winLine.includes(cellIndex);
                const canPlay = isFirstMove || (isActive && !miniWinners[miniIndex] && !winner);
                
                return (
                  <motion.button
                    key={cellIndex}
                    onClick={() => isBoardReady && handleClick(miniIndex, cellIndex)}
                    className={`w-10 h-10 text-xl font-bold border border-gray-500 flex items-center justify-center transition-all duration-150 ${
                      isWinLine && boardWinner ? 'bg-opacity-100' : ''
                    } ${!canPlay || !isBoardReady ? 'pointer-events-none opacity-60' : ''}`}
                    style={{
                      color: getCellColor(cell),
                      backgroundColor:
                        isWinLine && boardWinner === 'X'
                          ? '#f87171'
                          : isWinLine && boardWinner === 'O'
                          ? '#60a5fa'
                          : isWinLine && boardWinner
                          ? '#e5e7eb'
                          : 'transparent',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    disabled={!canPlay || !isBoardReady}
                  >
                    {cell}
                  </motion.button>
                );
              })}
              {miniWinners[miniIndex] && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-[3rem] font-extrabold opacity-30 pointer-events-none"
                  style={{ color: getCellColor(miniWinners[miniIndex]) }}
                >
                  {miniWinners[miniIndex]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Status */}
      <p className="text-lg mt-4">
        {winner ? (
          <span className="text-2xl font-bold">
            🏆 Winner: <span className={winner.winner === 'X' ? 'text-red-500' : 'text-blue-500'}>{winner.winner}</span>
          </span>
        ) : (
          <span className="text-xl">
            Next: <span className={currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500'}>{currentPlayer}</span>
            {activeBoard !== null && (
              <span className="text-gray-400"> (Play in board {activeBoard + 1})</span>
            )}
          </span>
        )}
      </p>

      {/* Game Controls */}
      <div className="flex gap-2 flex-wrap justify-center mt-4">
        <button
          onClick={resetGame}
          className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 transition"
        >
          Reset Game
        </button>
        {mode !== 'online' && (
          <button
            onClick={undoMove}
            disabled={moveHistory.length === 0}
            className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Undo
          </button>
        )}
        {onBack && (
          <button
            onClick={handleBack}
            className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-300 transition"
          >
            Back to Game Selection
          </button>
        )}
      </div>

      {showStartAlert && (
        <div className="fixed top-0 left-0 w-full flex justify-center z-50">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-b-lg shadow-lg text-xl font-bold mt-2 animate-bounce">
            Game is starting!
          </div>
        </div>
      )}
    </div>
  );
} 