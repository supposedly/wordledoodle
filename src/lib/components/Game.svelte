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
  const SHAKE_DURATION = 250;
  let shaking = false;

  function solve(message: CustomEvent<{answer: string, patterns: {state: State, value: string | null}[][]}>) {
    if (!dictionary.has(message.detail.answer)) {
      error('Not in word list');
      return;
    }
    console.log(
      message.detail.patterns.map(
        pattern => dictionary.match(
          pattern.map(({state}) => state),
          message.detail.answer
        )
      )
    );
  }

  function error(message: string) {
    toaster.push(message);
    shake();
  }

  function shake() {
    shaking = true;
    setTimeout(() => { shaking = false; }, SHAKE_DURATION);
  }
</script>


<article class="game" style="--shake-duration: {SHAKE_DURATION}ms">
  <Picker bind:paintState />
  <section class="item-center container" bind:clientHeight={containerHeight}>
    <ToastContainer {toaster}/>
    <Grid {containerHeight} {paintState} {shaking} on:solve={solve} />
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
  }

  .container {
    flex-grow: 1;
    overflow: hidden;
  }
</style>
