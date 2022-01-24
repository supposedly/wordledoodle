<script lang="ts">
  import type { State } from '../utils/types';
  import type { Dictionary } from '../utils/search';
  import { SHAKE_DURATION } from '../utils/constants';
  
  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';
  import SelectNumber from './NumberInput/SelectNumber.svelte';

  import ToastContainer from './Notifications/Container.svelte';
  import { Toaster } from './Notifications/toaster';

  const length = 5;
  const height = 6;
  const toaster = new Toaster<string>();

  export let dictionary: Dictionary;

  let containerHeight: number;
  let containerWidth: number;
  let paintState: State;

  let shaking = false;

  let lightTheme: boolean;
  let highContrast: boolean;

  $: if (lightTheme) {
    toaster.push("Wordle's light theme won't look like this");
    setTimeout(() => toaster.push("But it'll use white squares ⬜ when you share it"), 1400);
  }

  const EMPTY_ARRAY = Array.from({length: dictionary.wordLength}, () => '');

  let unsolvableRows: number[] = [];
  let possibleSolves: string[][] = Array.from({length: height}, () => [...EMPTY_ARRAY]);

  function solve(message: CustomEvent<{answer: string, patterns: State[][]}>) {
    possibleSolves = message.detail.patterns.map(
      pattern => dictionary.match(
        pattern,
        message.detail.answer
      )
    ).map(set =>
      // this is the worst :---------|
      // getting random element out of a set should be constant-time
      [...set][Math.floor(Math.random() * set.size)]
    ).map(
      word => word ? [...word] : [...EMPTY_ARRAY]
    );

    unsolvableRows = possibleSolves.map((_, row) => row).filter(row => possibleSolves[row][0] === '');
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


<article class="game" class:lightTheme class:highContrast style="--shake-duration: {SHAKE_DURATION}ms">
  <Picker bind:lightTheme bind:highContrast bind:paintState />
  <section class="item-center container" bind:clientHeight={containerHeight} bind:clientWidth={containerWidth}>
    <ToastContainer {toaster}/>
    <Grid
      {length} {height}
      {containerHeight} {containerWidth}
      {paintState}
      {shaking}
      {unsolvableRows}
      {possibleSolves}
      on:solve={solve}
    />
  </section>
  <!-- <SelectNumber highNumber={218}/> -->
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

  .lightTheme {
    --color-absent: #ccccdd;
  }

  .highContrast {
    --color-correct: var(--orange);
    --color-present: var(--blue);
  }
</style>
