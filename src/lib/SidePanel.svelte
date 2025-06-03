<script lang="ts">
  import NextPiece from '$lib/NextPiece.svelte';
  import Controls from '$lib/Controls.svelte';
  export let nextTetromino;
  export let score;
  export let paused;
//   export let gameLevel;
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="side">
  <NextPiece {nextTetromino} />
  <p class="score">Score: {score}</p>
  <!-- <p class="score">Level: {gameLevel}</p> -->
  <Controls />
  <div class="buttons">
    <button class="restart neon-button" on:click={() => dispatch('restart')} aria-label="Restart Game">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
      </svg>
    </button>
    <button class="neon-button" on:click={() => dispatch('togglePause')}>
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
