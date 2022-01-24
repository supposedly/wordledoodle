<script lang="ts">
  import type { State, WordleWord } from '../utils/types';
  import type { Dictionary } from '../utils/search';
  import { SHAKE_DURATION, SPAM_CLICK_TIMEOUT, TODAYS_WORDLE } from '../utils/constants';

  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';
  import Daywise from './Input/Daywise.svelte';
  import ToastContainer from './Notifications/Container.svelte';
  import { Toaster } from './Notifications/toaster';

  import { onMount } from 'svelte';
  
  const length = 5;
  const height = 6;
  
  const toaster = new Toaster<string>();
    
  export let dictionary: Dictionary;
  const EMPTY_ARRAY = Array.from({length: dictionary.wordLength}, () => '');
  let unsolvableRows: number[] = [];
  let possibleSolves: string[][] = Array.from({length: height}, () => [...EMPTY_ARRAY]);

  let containerHeight: number;
  let containerWidth: number;
  let paintState: State;

  let lightTheme: boolean = false;
  let highContrast: boolean = false;

  let lightThemeMessage1Timeout: ReturnType<typeof setTimeout>;
  let lightThemeMessage2Timeout: ReturnType<typeof setTimeout>;

  let loaded: boolean = false;

  onMount(() => { loaded = true; })

  function toast(message: string) {
    if (!loaded) {
      // otherwise it'll pop up with all of those reactive messages on page load
      // (ik the smart thing to do would be to call toaster.push() in an event handler
      // instead of from a reactive block, which would also obviate the weird isolation
      // of clearTimeout() that u gotta do to avoid an infinite loop, but w/e)
      return;
    }
    toaster.push(message);
  }

  $: if (!lightTheme) {
    clearTimeout(lightThemeMessage1Timeout);
    clearTimeout(lightThemeMessage2Timeout);
  }

  $: if (lightTheme) {
    toast("Dark theme off");
    lightThemeMessage1Timeout = setTimeout(() => {
      toast("(Wordle won't look like this with dark theme off,")
      lightThemeMessage2Timeout = setTimeout(() => toast("but it'll use white squares ⬜ when you share)"), 1400);
    }, 1400);
  } else {
    toast("Dark theme on");
  }

  $: if (highContrast) {
    toast("High contrast on");
  } else {
    toast("High contrast off");
  }

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

  let wordFromWordle: WordleWord = {word: null, hidden: null};

  let wordToastTimeout: ReturnType<typeof setTimeout>;
  function setWordFromWordle(message: CustomEvent<{index: number, hidden: boolean}>) {
    clearTimeout(wordToastTimeout);

    const index = message.detail.index;
    const hidden = message.detail.hidden;

    if (index === TODAYS_WORDLE) {
      wordToastTimeout = setTimeout(
        () => toast(hidden ? "Showing today's word (hidden)" : "Showing today's word"),
        SPAM_CLICK_TIMEOUT
      );
    } else if (index === TODAYS_WORDLE - 1) {
      wordToastTimeout = setTimeout(
        () => toast("Showing yesterday's word"),
        SPAM_CLICK_TIMEOUT
      );
    } else {
      wordToastTimeout = setTimeout(
        () => toast(`Showing word from ${TODAYS_WORDLE - index} days ago`),
        SPAM_CLICK_TIMEOUT
      );
    }

    wordFromWordle = {word: dictionary.rawDictionary[index], hidden};
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
      {unsolvableRows}
      {possibleSolves}
      givenWord={wordFromWordle}
      on:solve={solve}
    />
  </section>
  <Daywise on:use={word => setWordFromWordle(word)} />
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
    margin-bottom: 0;
  }

  .lightTheme {
    --color-absent: #ccccdd;
    --letter-color-absent: var(--black);
  }

  .highContrast {
    --color-correct: var(--orange);
    --color-present: var(--blue);
  }
</style>
