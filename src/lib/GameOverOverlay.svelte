<script lang="ts">
  export let score;
  export let gameLevel;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="game-over-overlay">
  <div class="game-over">
    <h1>Game Over</h1>
    <div>Score: {score}</div>
    <div>Level: {gameLevel}</div>
    <button class="neon-button" on:click={() => dispatch('restart')}>Play Again</button>
  </div>
</div>
