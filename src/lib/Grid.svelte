<script lang="ts">
  import type { Board, Tetromino } from '$lib/types';
  export let board: Board;
  export let tetromino: Tetromino | null;
  export let gameOver: boolean;

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
</script>

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
