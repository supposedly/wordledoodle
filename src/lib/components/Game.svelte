<script lang="ts">
  import type { State } from '../utils/enums';

  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';

  export let dictionary: string[];

  let containerHeight: number;
  let paintState: State;

  function solve(message: CustomEvent<{answer: string}>) {
    const answer = message.detail.answer;
  
    let low = 0;
    let high = dictionary.length - 1;
    let mid: number;

    do {
      mid = Math.floor((high + low) / 2);
      if (dictionary[mid] > answer) {
        high = mid;
      }
      if (dictionary[mid] < answer) {
        low = mid;
      }
      if (high - low <= 1) {
        break;
      }
    } while (dictionary[mid] !== answer);

    console.log(dictionary[mid] === answer);
  }
</script>

<article class="game">
  <section class="item-center" bind:clientHeight={containerHeight}>
    <Picker bind:paintState />
  </section>
  <section class="item-center board-container" bind:clientHeight={containerHeight}>
    <Grid {containerHeight} {paintState} on:solve={solve} />
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
