<script lang="ts">
  import type { State } from '../utils/enums';
  import type { Dictionary } from '../utils/search';
  
  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';

  import ToastContainer from './Notifications/Container.svelte';
  import { Toaster } from './Notifications/toaster';

  export let dictionary: Dictionary;

  let containerHeight: number;
  let paintState: State;

  const toaster = new Toaster<string>();

  function solve(message: CustomEvent<{answer: string, patterns: string[]}>) {
    if (!dictionary.has(message.detail.answer)) {
      toaster.push('Not in word list');
    }
  }
</script>

<ToastContainer {toaster}/>

<article class="game">
  <Picker bind:paintState />
  <section class="item-center container" bind:clientHeight={containerHeight}>
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

  .container {
    flex-grow: 1;
    overflow: hidden;
  }
</style>
