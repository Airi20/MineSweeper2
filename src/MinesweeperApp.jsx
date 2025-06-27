import React, { useState, useEffect, useRef } from 'react';

const ROWS = 10;
const COLS = 10;
const MINES = 10;

const generateBoard = () => {
  const board = Array(ROWS).fill().map(() => Array(COLS).fill(null).map(() => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].mine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
          }
        }
        board[r][c].adjacent = count;
      }
    }
  }
  return board;
};

const Cell = ({ data, onClick, onRightClick, onTouchStart, onTouchEnd, size }) => {
  let content = '';
  if (data.revealed) {
    if (data.mine) content = '💣';
    else if (data.adjacent > 0) content = data.adjacent;
  } else if (data.flagged) {
    content = '🚩';
  }
  return (
    <div
      onClick={onClick}
      onContextMenu={onRightClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        width: size,
        height: size,
        border: '1px solid black',
        backgroundColor: data.revealed ? '#ccc' : '#eee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {content}
    </div>
  );
};

const getCellSize = () => {
  if (window.innerWidth < 400) return 28;
  if (window.innerWidth < 600) return 32;
  return 44;
};

const MinesweeperApp = () => {
  const [board, setBoard] = useState(generateBoard());
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [cellSize, setCellSize] = useState(getCellSize());
  const longPressTimeout = useRef(null);

  useEffect(() => {
    const askName = () => {
      let name = '';
      while (!name) {
        name = prompt('ニックネームを入力してください：');
      }
      setNickname(name);
    };
    askName();
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const handleResize = () => setCellSize(getCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const revealCell = (r, c, newBoard) => {
    if (!newBoard[r][c] || newBoard[r][c].revealed || newBoard[r][c].flagged) return;
    newBoard[r][c].revealed = true;
    if (newBoard[r][c].adjacent === 0 && !newBoard[r][c].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            revealCell(nr, nc, newBoard);
          }
        }
      }
    }
  };

  const checkWin = (board) => {
    return board.flat().every(cell => cell.mine || cell.revealed);
  };

  const handleClick = (r, c) => {
    if (gameOver) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (newBoard[r][c].mine) {
      newBoard[r][c].revealed = true;
      setBoard(newBoard);
      setGameOver(true);
      setWin(false);
    } else {
      revealCell(r, c, newBoard);
      const isClear = checkWin(newBoard);
      setBoard(newBoard);
      if (isClear) {
        setGameOver(true);
        setWin(true);
      }
    }
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
    if (gameOver) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
  };

  const handleTouchStart = (r, c) => {
    if (gameOver) return;
    longPressTimeout.current = setTimeout(() => {
      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      newBoard[r][c].flagged = !newBoard[r][c].flagged;
      setBoard(newBoard);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  const resetGame = () => {
    setBoard(generateBoard());
    setGameOver(false);
    setWin(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff0f5',
        fontFamily: "'Comic Neue', cursive",
        textAlign: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: '15px', marginBottom: '10px' }}>
        最近フロントだけで楽してるしレポート終わったらDBと連携してタイム競えるようにする  2025/06/27  ＃１日１アプリ生活
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          border: '2px solid pink',
          marginBottom: '10px',
          userSelect: 'none',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              data={cell}
              onClick={() => handleClick(r, c)}
              onRightClick={isMobile ? undefined : (e) => handleRightClick(e, r, c)}
              onTouchStart={isMobile ? () => handleTouchStart(r, c) : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
              size={cellSize}
            />
          ))
        )}
      </div>

      <button
        onClick={resetGame}
        style={{
          background: 'pink',
          padding: '8px 16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '12px',
          fontSize: '16px',
        }}
      >
        🔁 リセット
      </button>


  {/* 長押し＆右クリックの説明 */}
  <div style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
  🚩は右クリックまたは長押し
  </div>


  

      {gameOver && (
  <div style={{ marginTop: 20, fontSize: '15px', fontWeight: 'bold', color: win ? 'green' : 'red' }}>
    {win ? `🎉 ${nickname}さん、天才！ 🎉` : `🥰 ${nickname}さん、次頑張ればいいんだよ 🥰`}
  </div>
)}

    </div>
  );
};

export default MinesweeperApp;
