<script lang="ts">
  export let nextTetromino;
</script>

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
