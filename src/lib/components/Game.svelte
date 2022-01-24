<script lang="ts">
  import type { State, WordleWord } from '../utils/types';
  import type { Dictionary } from '../utils/search';
  import { SHAKE_DURATION, SPAM_CLICK_TIMEOUT, TODAYS_WORDLE } from '../utils/constants';

  import Grid from './Board/Grid.svelte';
  import Picker from './Paint/Picker.svelte';
  import Daywise from './Input/Daywise.svelte';
  import Toaster from './Notifications/Toaster.svelte';
  import { ToastQueue } from './Notifications/toastQueue';

  import { onMount } from 'svelte';
  import { DefaultMap, LRUMap } from 'mnemonist';
  import ArrayKeyedMap from 'array-keyed-map';
  
  export let dictionary: Dictionary;
  const height = 6;
  const length = dictionary.wordLength;
  
  const toaster = new ToastQueue<string>();
    
  const EMPTY_ARRAY = Array.from({length}, () => '');
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

  let patternCache = new DefaultMap<string, LRUMap<State[], string[]>>(
    () => {
      let map = new LRUMap<State[], string[]>(32);
      (map as any).items = new ArrayKeyedMap();  // hack!
      return map;
    }
  );

  function solve(message: CustomEvent<{answer: string, patterns: State[][]}>) {
    const {answer, patterns} = message.detail;
    possibleSolves = patterns.map(pattern => {
      const cache = patternCache.get(answer);
      if (!cache.has(pattern)) {
        cache.set(pattern, [...dictionary.match(pattern, answer)]);
      }
      return cache.get(pattern) as string[];
    }).map(
      solves => solves[Math.floor(Math.random() * solves.length)]
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
        () => toast(hidden
          ? `Today's wordle <span style="font-size: small;">(hidden)</span>`
          : `Today's wordle`// <span style="font-size: small;">(#${index})</span>`
        ),
        SPAM_CLICK_TIMEOUT
      );
    } else if (index === TODAYS_WORDLE - 1) {
      wordToastTimeout = setTimeout(
        () => toast(`#${index} <span style="font-size: small;">(yesterday)</span>`),
        SPAM_CLICK_TIMEOUT
      );
    } else {
      wordToastTimeout = setTimeout(
        () => toast(`#${index} <span style="font-size: small;">(${TODAYS_WORDLE - index} days ago)</span>`),
        SPAM_CLICK_TIMEOUT
      );
    }

    wordFromWordle = {word: dictionary.rawDictionary[index], hidden};
  }
</script>


<article class="game" class:lightTheme class:highContrast style="--shake-duration: {SHAKE_DURATION}ms">
  <Picker bind:lightTheme bind:highContrast bind:paintState />
  <section class="item-center container" bind:clientHeight={containerHeight} bind:clientWidth={containerWidth}>
    <Toaster {toaster}/>
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
