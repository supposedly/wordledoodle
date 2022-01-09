<script lang="ts">
  import type { State } from '../utils/enums';
  import type { Dictionary } from '../utils/search';

  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';

  export let dictionary: Dictionary;

  let containerHeight: number;
  let paintState: State;

  let errorMessage: string = '';  // TODO: replace with a special object or something

  function solve(message: CustomEvent<{answer: string, patterns: string[]}>) {
    errorMessage = '';
    if (!dictionary.has(message.detail.answer)) {
      errorMessage = 'Not in word list';
    }
  }
</script>

<article class="game">
  <Picker bind:paintState />
  <section class="item-center container" bind:clientHeight={containerHeight}>
    <Grid {containerHeight} {paintState} on:solve={solve} />
  </section>
  <p class="error">
    {errorMessage}
  </p>
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

  .error {
    flex-grow: 1;
    text-align: center;
    color: var(--white);
  }
</style>
