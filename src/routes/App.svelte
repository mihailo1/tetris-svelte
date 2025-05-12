<script lang="ts">
  import '../lib/tetris-styles.css';
  
  const SHAPES = {
    I: [
      [0,0,0,0, 1,1,1,1, 0,0,0,0, 0,0,0,0],
      [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      [0,0,0,0, 0,0,0,0, 1,1,1,1, 0,0,0,0],
      [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0]
    ],
    O: [
      [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,1,0, 0,1,1,0, 0,0,0,0]
    ],
    T: [
      [0,0,0,0, 0,1,0,0, 1,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,0,0, 0,1,1,0, 0,1,0,0],
      [0,0,0,0, 0,0,0,0, 1,1,1,0, 0,1,0,0],
      [0,0,0,0, 0,1,0,0, 1,1,0,0, 0,1,0,0]
    ],
    S: [
      [0,0,0,0, 0,1,1,0, 1,1,0,0, 0,0,0,0],
      [0,0,0,0, 0,1,0,0, 0,1,1,0, 0,0,1,0],
      [0,0,0,0, 0,1,1,0, 1,1,0,0, 0,0,0,0],
      [0,0,0,0, 1,0,0,0, 1,1,0,0, 0,1,0,0]
    ],
    Z: [
      [0,0,0,0, 1,1,0,0, 0,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,0,1,0, 0,1,1,0, 0,1,0,0],
      [0,0,0,0, 1,1,0,0, 0,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,0,0, 1,1,0,0, 1,0,0,0]
    ],
    J: [
      [0,0,0,0, 1,0,0,0, 1,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,1,0, 0,1,0,0, 0,1,0,0],
      [0,0,0,0, 0,0,0,0, 1,1,1,0, 0,0,1,0],
      [0,0,0,0, 0,1,0,0, 0,1,0,0, 1,1,0,0]
    ],
    L: [
      [0,0,0,0, 0,0,1,0, 1,1,1,0, 0,0,0,0],
      [0,0,0,0, 0,1,0,0, 0,1,0,0, 0,1,1,0],
      [0,0,0,0, 0,0,0,0, 1,1,1,0, 1,0,0,0],
      [0,0,0,0, 1,1,0,0, 0,1,0,0, 0,1,0,0]
    ]
  };

  const COLORS = {
    I: 'cyan',
    O: 'yellow',
    T: 'purple',
    S: 'green',
    Z: 'red',
    J: 'blue',
    L: 'orange'
  };

  type Tetromino = {
    type: keyof typeof SHAPES;
    rotation: number;
    row: number;
    col: number;
    shape: number[];
    color: string;
  };

  let board = $state(Array(20).fill(0).map(() => Array(10).fill(0)));
  let tetromino = $state<Tetromino | null>(null);
  let nextTetromino = $state<Tetromino | null>(null);
  let score = $state(0);
  let gameOver = $state(false);
  let paused = $state(false);
  let interval = $state(0);
  let gameLevel = $state(1);
  let lastTwoTypes = $state<Array<keyof typeof SHAPES>>([]);

  function randomType(): keyof typeof SHAPES {
    const types: Array<keyof typeof SHAPES> = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const availableTypes = types.filter(type => !lastTwoTypes.includes(type));
    const pool = availableTypes.length > 0 ? availableTypes : types;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createRandomTetromino() {
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

  function getCellColor(row: number, col: number) {
    if (tetromino && !gameOver) {
      const x = col - tetromino.col;
      const y = row - tetromino.row;
      if (x >= 0 && x < 4 && y >= 0 && y < 4) {
        const index = y * 4 + x;
        if (tetromino.shape[index]) {
          return tetromino.color;
        }
      }
    }

    return board[row][col] || 'transparent';
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
  <h2 class="title">Tetris</h2>
  
  {#if gameOver}
      <div class="game-over-overlay">
          <div class="game-over">
              <h1>Game Over</h1>
              <button class="neon-button" onclick={startGame}>Play Again</button>
          </div>
      </div>
  {/if}

  <div class="game-area">
      <div class="side">
          <div class="next-piece">
              <h3>Next:</h3>
              <div class="next-grid">
                  {#if nextTetromino}
                      {#each Array(16) as _, i}
                          <div
                              class="next-cell"
                              class:active={nextTetromino.shape[i]}
                              style:background-color={nextTetromino.shape[i] ? nextTetromino.color : 'transparent'}
                          ></div>
                      {/each}
                  {/if}
              </div>
          </div>
          <p class="score">Score: {score}</p>
          <div class="controls">
              <p>Controls:</p>
              <p> ← → Move | ↑ Rotate</p>
              <p> Space Drop | ↓ Move down </p>
          </div>
            <div class="buttons">
              <button class="restart neon-button" onclick={startGame} aria-label="Restart Game">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
                </svg>
              </button>
              <button class="neon-button" onclick={toggleGame}>
                {#if paused}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                  </svg>
                {/if}
              </button>
            </div>
      </div>
      
      <div class="grid">
          {#each board as row, y}
              <div class="row">
                  {#each row as cell, x}
                      <div
                          class="cell"
                          class:active={cell !== null}
                          style:background-color={getCellColor(y, x)}
                      ></div>
                  {/each}
              </div>
          {/each}
      </div>
  </div>
</div>

<svelte:window on:keydown={handleKeyDown} />