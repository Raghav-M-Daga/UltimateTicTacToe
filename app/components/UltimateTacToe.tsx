  const updateData = {
    ...gameData,
    board: boardArrToObj(Object.values(newGameState).map(mini => Object.values(mini)) as BoardState),
    currentPlayer: gameData.currentPlayer === 'X' ? 'O' : 'X',
    activeBoard: nextActiveBoard,
    winner: mainWinner,
    miniWinners: newMiniWinners,
    boardArray: newBoardArray,
    miniWinnersArray: gameData.miniWinnersArray,
    test: gameData.test,
    lastMove: {
      board: boardIndex,
      cell: cellIndex,
      player: gameData.currentPlayer,
      timestamp: Date.now()
    }
  }; 