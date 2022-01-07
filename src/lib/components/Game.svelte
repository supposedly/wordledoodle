<script lang="ts">
  import type { State } from '../utils/enums';

  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';

  export let dictionary: string[];

  let containerHeight: number;
  let paintState: State;
</script>

<article class="game">
  <section class="item-center">
    <Picker bind:paintState />
  </section>
  <section class="item-center board-container" bind:clientHeight={containerHeight}>
    <Grid containerHeight={containerHeight} paintState={paintState} />
  </section>
</article>

<style>
  .game {
    width: 100%;
    max-width: var(--game-max-width);
    margin: 0 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .item-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .board-container {
    flex-grow: 1;
    overflow: hidden;
  }
</style>
