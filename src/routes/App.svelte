<script lang="ts">
  import '../lib/tetris-styles.css';
  import Title from '$lib/Title.svelte';
  import GameArea from '$lib/GameArea.svelte';
  import GameOverOverlay from '$lib/GameOverOverlay.svelte';
  import type { Tetromino, Board } from '$lib/types';
  import { SHAPES, COLORS, TETROMINO_TYPES } from '$lib/constants';

  let board: Board = $state(Array(20).fill(0).map(() => Array(10).fill(0)));
  let tetromino: Tetromino | null = $state(null);
  let nextTetromino: Tetromino | null = $state(null);
  let score: number = $state(0);
  let gameOver: boolean = $state(false);
  let paused: boolean = $state(false);
  let interval: number = $state(0);
  let gameLevel: number = $state(1);
  let lastTwoTypes: Array<keyof typeof SHAPES> = $state([]);

  function randomType(): keyof typeof SHAPES {
    const availableTypes = TETROMINO_TYPES.filter(type => !lastTwoTypes.includes(type));
    const pool = availableTypes.length > 0 ? availableTypes : TETROMINO_TYPES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createRandomTetromino(): Tetromino {
    const type = randomType();
    return {
      type,
      rotation: 0,
      row: 0,
      col: 3,
      shape: SHAPES[type][0],
      color: COLORS[type]
    };
  }

  function isValidPosition(tetro: Tetromino | null) {
    if (!tetro) return false;

    for (let i = 0; i < 16; i++) {
      const x = tetro.col + (i % 4);
      const y = tetro.row + Math.floor(i / 4);

      if (tetro.shape[i]) {
        if (x < 0 || x >= 10 || y >= 20) {
          return false;
        }
        if (y >= 0 && board[y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  function moveLeft() {
    if (gameOver || paused || !tetromino) return;
    const newTetromino = { ...tetromino, col: tetromino.col - 1 };
    if (isValidPosition(newTetromino)) {
      tetromino = newTetromino;
    }
  }

  function moveRight() {
    if (gameOver || paused || !tetromino) return;  
    const newTetromino = { ...tetromino, col: tetromino.col + 1 };
    if (isValidPosition(newTetromino)) {
      tetromino = newTetromino;
    }
  }

  function moveDown() {
    if (gameOver || paused || !tetromino) return;
    const newTetromino = { ...tetromino, row: tetromino.row + 1 };
    if (isValidPosition(newTetromino)) {
      tetromino = newTetromino;
    } else {
      landTetromino();
    }
  }

  function rotate() {
    if (gameOver || paused || !tetromino) return;
    const newRotation = (tetromino.rotation + 1) % 4;
    const newShape = SHAPES[tetromino.type][newRotation];
    let newTetromino = {
      ...tetromino,
      rotation: newRotation,
      shape: newShape
    };

    // Wall kick
    const offsets = [-1, 1, -2, 2];
    for (const offset of offsets) {
      newTetromino.col += offset;
      if (isValidPosition(newTetromino)) {
        tetromino = newTetromino;
        return;
      }
      newTetromino.col -= offset;
    }
  }

  function landTetromino() {
    // Create a new board to ensure reactivity
    const newBoard = board.map(row => [...row]);
    if (!tetromino) return;

    // Fix the tetromino
    for (let i = 0; i < 16; i++) {
      const x = tetromino.col + (i % 4);
      const y = tetromino.row + Math.floor(i / 4);
      if (tetromino.shape[i] && y >= 0 && x >= 0 && x < 10 && y < 20) {
        newBoard[y][x] = tetromino.color;
      }
    }

    // Check for full rows
    const fullRows = [];
    for (let y = 0; y < 20; y++) {
      if (newBoard[y].every(cell => cell)) {
        fullRows.push(y);
      }
    }

    // Remove full rows
    if (fullRows.length > 0) {
      for (const row of fullRows) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(10).fill(0));
      }
      const level = Math.floor(score / 1000) + 1;
      switch (fullRows.length) {
        case 1:
          score += 100 * level;
          break;
        case 2:
          score += 300 * level;
          break;
        case 3:
          score += 500 * level;
          break;
        case 4:
          score += 800 * level;
          break;
      }

      // Increase gameLevel and speed every 1000 points
      if (score >= gameLevel * 1000) {
        gameLevel++;
        clearInterval(interval);
        interval = setInterval(() => {
          if (!gameOver && !paused) {
            moveDown();
          }
        }, Math.max(1000 - (gameLevel - 1) * 100, 100));
      }

    }

    board = newBoard;

    // Create new tetromino
    tetromino = nextTetromino || createRandomTetromino();
    lastTwoTypes = [tetromino.type, ...(lastTwoTypes.slice(0, 1))];
    nextTetromino = createRandomTetromino();

    if (!isValidPosition(tetromino)) {
      gameOver = true;
      if (interval) {
        clearInterval(interval);
      }
    }
  }

  function toggleGame() {
    if (gameOver) return;
    paused = !paused;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      paused = !paused;
      return;
    }
    if (event.key === 'Enter') {
      startGame();
      return;
    }
    if (event.key === 'r') {
      startGame();
      return;
    }

    if (paused) return;
    if (gameOver) return;
    switch (event.key) {
      case 'ArrowLeft': moveLeft(); break;
      case 'ArrowRight': moveRight(); break;
      case 'ArrowDown': moveDown(); break;
      case 'ArrowUp': rotate(); break;
      case ' ':
        // Hard drop
        while (tetromino && isValidPosition({ ...tetromino, row: tetromino.row + 1 } as Tetromino)) {
          tetromino = { ...tetromino, row: tetromino.row + 1 };
        }
        landTetromino();
        break;
    }
    event.preventDefault();
  }

  function startGame() {
    if (interval) {
      clearInterval(interval);
    }
    paused = false;
    board = Array(20).fill(0).map(() => Array(10).fill(0));
    tetromino = createRandomTetromino();
    lastTwoTypes = [tetromino.type];
    nextTetromino = createRandomTetromino();
    score = 0;
    gameOver = false;
    paused = false;
    gameLevel = 1;
    interval = setInterval(() => {
      if (!gameOver && !paused) {
        moveDown();
      }
    }, 1000);
  }
  
  startGame();

  $effect(() => {
    return () => clearInterval(interval);
  });
</script>

<div class="container">
  <Title />
  <GameArea
    {board}
    {tetromino}
    {nextTetromino}
    {score}
    {paused}
    {gameOver}
    gameLevel={gameLevel}
    on:restart={startGame}
    on:togglePause={toggleGame}
  />
  {#if gameOver}
    <GameOverOverlay {score} gameLevel={gameLevel} on:restart={startGame} />
  {/if}
</div>
<svelte:window on:keydown={handleKeyDown} />