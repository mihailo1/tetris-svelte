<script lang="ts">
  import SidePanel from '$lib/SidePanel.svelte';
  import Grid from '$lib/Grid.svelte';
  export let board;
  export let tetromino;
  export let nextTetromino;
  export let score;
  export let paused;
  export let gameOver;
  export let gameLevel;
  // Forward events for restart, togglePause, keydown
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  function handleRestart() { dispatch('restart'); }
  function handleTogglePause() { dispatch('togglePause'); }
</script>

<div class="game-area">
  <SidePanel
    {nextTetromino}
    {score}
    {paused}
    {gameLevel}
    on:restart={handleRestart}
    on:togglePause={handleTogglePause}
  />
  <Grid {board} {tetromino} {gameOver} />
</div>
