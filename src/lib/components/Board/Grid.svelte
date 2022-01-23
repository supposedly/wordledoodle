<script lang="ts">
  import { State } from '../../utils/types';
  import { SHAKE_DURATION } from '../../utils/constants';
  
  import Cell from './Cell.svelte';
  import Letterwise from '../Input/Letterwise.svelte';

  import { createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';

  export let unsolvableRows: number[];
  export let shaking = false;
  export let centerSelf = true;
  export let length: number;
  export let height: number;
  export let paintState: State;
  let fullySolvedRow: number = height;

  $: gameWidth = 1 + length;
  $: gameHeight = 1 + height;
  $: gameRatio = gameWidth / gameHeight;

  const ALL_FALSE = Array.from({length: height}, () => false);
  let shakingRows: boolean[];
  $: {
    shakingRows = Array.from({length: height}, (_, idx) => unsolvableRows.includes(idx));
    setTimeout(
      () => { shakingRows = ALL_FALSE; },
      SHAKE_DURATION
    )
  }

  export let possibleSolves: (string | null)[][];
  let patterns = Array.from(
    {length: height},
    _ => Array.from({length}, () => State.Empty)
  );

  $: {
    // disable all rows below a fully-solved one (since wordle stops you from writing past that point)
    let i = -1;
    for (i = 0; i < patterns.length; i++) {
      if (patterns[i].every(state => state === State.Right)) {
        break;
      }
    }
    fullySolvedRow = i === -1 ? height : i;

    for (i = patterns.length - 1; i >= 0; i--) {
      if (i > fullySolvedRow) {
        patterns[i] = patterns[i].map(state => state === State.Wrong ? State.Empty : state);
      } else {
        patterns[i] = patterns[i].map(state => state === State.Empty ? State.Wrong : state);
      }
    }

    patterns = patterns;
  }

  function clearRow(word: State[]) {
    return word.map(() => State.Empty);
  }

  export let containerHeight: number;
  export let containerWidth: number;
  let receivedContainerHeight = false;
  let boardWidth = tweened(0);
  let boardHeight = tweened(0);

  $: if (!receivedContainerHeight && containerHeight !== undefined) {
      const width = Math.min(Math.floor(containerHeight * gameRatio), containerWidth);
      boardWidth = tweened(width, {duration: 100});
      boardHeight = tweened(gameHeight * Math.floor(width / gameWidth), {duration: 100});
      receivedContainerHeight = true;
    }

  $: if (receivedContainerHeight) {
      const width = Math.min(Math.floor(containerHeight * gameRatio), containerWidth);
      boardWidth = tweened(width, {duration: 100});
      boardHeight = tweened(gameHeight * Math.floor(width / gameWidth), {duration: 100});
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

function rowChanged(row: number, flip: boolean) {
  if (possibleSolves[row]) {
    possibleSolves[row] = possibleSolves[row].map(
      flip
      ? (letter => letter === '' ? '\u200b' : '')  // keep flipping forever by alternating btwn empty & zwsp
      : () => null
    );
    possibleSolves = possibleSolves;
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
    <div class="row" class:shaking={shakingRows[row] && word[0] !== State.Empty}> <!-- dumb thing to avoid making empty rows shake -->
      {#each word as state, col}
        <Cell
          bind:state
          ter={possibleSolves[row][col]}
          defaultState={row <= fullySolvedRow ? State.Wrong : State.Empty}
          disabled={row > fullySolvedRow}
          flipDelay={col * 25}
          {paintState}
          on:statechange={() => { rowChanged(row, false); }}
        />
      {/each}
      <button
        class="clear"
        title="Clear this row"
        disabled={row > fullySolvedRow}
        on:click={() => { word = clearRow(word); rowChanged(row, true); }}
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
      <button title="Solve for matching words" on:click|preventDefault={() => dispatch()} disabled={!valid}></button>
    </Letterwise>
  </form>
</div>

<style lang="scss">
  .board, .row {
    transition: transform var(--shake-duration) cubic-bezier(0.5, 3, 0.5, -3);
    transform: translateX(0);
    &.shaking {
      transform: translateX(15px);
    }
  }
  .board {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-gap: 5px;
    padding: 10px;
    box-sizing: border-box;

    &.center {
      align-self: center;
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

    .clear {
      background-color: var(--black);
      font-size: min(3.5vh, 1em);

      &::after {
        content: "❌";
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
