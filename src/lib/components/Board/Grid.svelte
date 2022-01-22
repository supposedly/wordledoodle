<script lang="ts">
  import { State } from '../../utils/types';
  import Cell from './Cell.svelte';
  import Letterwise from '../Input/Letterwise.svelte';
  import { createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';

  // not sure anymore whether making Empty the blank state is useful...
  // the minimum possible state once the game is actually solved will
  // be State.Wrong anyway
  const BlankState = State.Empty;
  /* const BlankState = State.Wrong */

  export let centerSelf = true;
  export let shaking = false;
  export let length = 5;
  export let height = 6;
  export let paintState: State;
  let highestEmptyRow: number = 0;

  $: gameWidth = 1 + length;
  $: gameHeight = 1 + height;
  $: gameRatio = gameWidth / gameHeight;
  $: minGameWidth = Math.min(containerWidth, 350);

  export let possibleSolves: string[];
  let patterns = Array.from(
    {length: height},
    _ => Array.from({length}, _ => BlankState)
  );

  $: {
    let i: number;
    for (i = 0; i < patterns.length; i++) {
      if (patterns[i].every(state => state === BlankState)) {
        break;
      }
    }
    highestEmptyRow = i;

    for (i = patterns.length - 1; i > 0; i--) {
      if (i > highestEmptyRow) {
        patterns[i] = patterns[i].map(() => BlankState);
      }
    }

    patterns = patterns;
  }

  function clearRow(word: State[]) {
    return word.map(() => BlankState);
  }

  export let containerHeight: number;
  export let containerWidth: number;
  let receivedContainerHeight = false;
  let boardWidth = tweened(0);
  let boardHeight = tweened(0);

  $: {
    if (!receivedContainerHeight && containerHeight !== undefined) {
      const width = Math.min(Math.floor(containerHeight * gameRatio), containerWidth);
      boardWidth = tweened(width, {duration: 100});
      boardHeight = tweened(gameHeight * Math.floor(width / gameWidth), {duration: 100});
      receivedContainerHeight = true;
    }
  }

  $: {
    if (receivedContainerHeight) {
      const width = Math.min(Math.floor(containerHeight * gameRatio), containerWidth);
      boardWidth = tweened(width, {duration: 100});
      boardHeight = tweened(gameHeight * Math.floor(width / gameWidth), {duration: 100});
    }
  }

  let timeoutId: ReturnType<typeof setTimeout>;
  function resizeBoard() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const width = Math.min(Math.floor(containerHeight * gameRatio), containerWidth);
      boardWidth.set(width);
      boardHeight.set(gameHeight * Math.floor(width / gameWidth));
    }, 25);
  }

  let initialized = false;

  // for some reason onMount won't work
  $: {
    if (!initialized && containerHeight !== undefined) {
    initialized = true;
    resizeBoard();
  }
}

// need to handle touchmove from up here rather than solely in the individual cells
// bc for some reason touchmove only fires on the element that was originally touchdown'd on...
function paintByTouch(e: TouchEvent) {
  const [pos] = e.changedTouches;
  if (pos !== undefined) {
    document.elementFromPoint(pos.clientX, pos.clientY)?.dispatchEvent(
      new TouchEvent('touchmove')
    );
  }
}

const dispatcher = createEventDispatcher();
const solve = ({detail: {answer}}: {detail: {answer: string}}) => dispatcher('solve', {answer, patterns});
</script>

<svelte:window on:resize={resizeBoard} />

<div
  class="board"
  class:center={centerSelf}
  class:shaking
  style="width: {$boardWidth}px; height: {$boardHeight}px;"
  on:touchmove|preventDefault={paintByTouch}
>
  {#each patterns as word, row}
    <div class="row">
      {#each word as state, idx}
        <Cell
          bind:state={state}
          ter={(possibleSolves[row] || '')[idx]}
          defaultState={row < highestEmptyRow ? State.Wrong : BlankState}
          disabled={row > highestEmptyRow}
          {paintState}
        />
      {/each}
      <button
        class="clear"
        title="Clear all rows from here on down"
        disabled={row > highestEmptyRow}
        on:click={() => word = clearRow(word)}
      ></button>
    </div>
  {/each}
  <form class="row">
    <Letterwise
      placeholder="word?"
      maxlength={1}
      {length}
      let:valid
      let:dispatch
      on:solve={solve}
    >
      <button title="Solve for this word" on:click|preventDefault={() => dispatch()} disabled={!valid}></button>
    </Letterwise>
  </form>
</div>

<style lang="scss">
  .board {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-gap: 5px;
    padding: 10px;
    box-sizing: border-box;
    transition: transform var(--shake-duration) cubic-bezier(0.5, 2, 0.5, -1);
    transform: translateX(0);

    &.center {
      align-self: center;
    }

    &.shaking {
      transform: translateX(15px);
    }

    * {
      user-select: none;
    }
  }
  
  .row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 5px;
    align-items: center;

    &:nth-last-child(2) .clear::after {
      content: "💥\A⬅️";

      @media screen and (max-height: 500px), screen and (max-width: 500px) {
        content: "⬅️💥";
      }
    }

    .clear {
      background-color: var(--black);
      font-size: min(3.5vh, 1em);

      &::after {
        content: "💥\A↙️";
        letter-spacing: -3px;
        white-space: pre;

        @media screen and (max-height: 500px), screen and (max-width: 500px) {
          content: "↙️💥";
        }
      }
    }
  }

  button {
    width: 90%;
    height: 90%;
    margin: 5px;
    border-radius: 5px;
    text-align: center;
    border: none;

    &:disabled, &[disabled] /* just paranoia, in reality the :disabled suffices except on IE */ {
      pointer-events: none;
    }
  }

  form.row {
    button {
      text-transform: uppercase;
      font-weight: bold;
      background-color: var(--darkened-green);
      font-weight: unset;

      &::after {
        content: "🎲";
      }
    }
  }
</style>
