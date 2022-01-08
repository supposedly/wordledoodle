<script lang="ts">
  import { State } from '../../utils/enums';
  import Cell from './Cell.svelte';
  import Letterwise from '../Input/Letterwise.svelte';

  type Letter = {state: State, value: string | null};

  // not sure anymore whether making Empty the blank state is useful...
  // the minimum possible state once the game is actually solved will
  // be State.Wrong anyway
  const BlankState = State.Empty;
  /* const BlankState = State.Wrong */

  export let length = 5;
  export let height = 6;
  export let paintState: State;
  let highestEmptyRow: number = 0;

  export const patterns: Letter[][] = Array.from(
    {length: height},
    _ => Array.from({length}, _ => ({state: BlankState, value: null}))
  );

  $: {
    let i: number;
  
    for (i = 0; i < patterns.length; i++) {
      if (patterns[i].every(letter => letter.state == BlankState)) {
        break;
      }
    }
    highestEmptyRow = i;

    for (i = patterns.length - 1; i > 0; i--) {
      if (i > highestEmptyRow) {
        patterns[i].forEach(letter => letter.state = BlankState);
        patterns[i] = patterns[i];
      }
    }
  }

  function updateRow(word: Letter[]) {
    word.forEach(letter => letter.state = BlankState);
    return word;
  }

  export let containerHeight: number;
  let boardWidth: number;
  let boardHeight: number;

  function resizeBoard() {
    boardWidth = Math.min(Math.floor(containerHeight * (5 / 6)), 350);
    boardHeight = 6 * Math.floor(boardWidth / 5);
  }

  let initialized = false;

  // for some reason onMount won't work
  $: {
    if (!initialized && containerHeight !== undefined) {
    initialized = true;
    resizeBoard();
  }
}
</script>

<svelte:window on:resize={resizeBoard} />

<div class="board" style={`width: ${boardWidth}px; height: ${boardHeight}px;`}>
  {#each patterns as word, row}
    <div class="row">
      <button
        class="clear"
        title="Clear all rows from here on down"
        disabled={row > highestEmptyRow}
        on:click={() => word = updateRow(word)}
      ></button>
      {#each word as letter}
        <Cell
          bind:state={letter.state}
          bind:ter={letter.value}
          defaultState={row < highestEmptyRow ? State.Wrong : BlankState}
          disabled={row > highestEmptyRow}
          {paintState}
        />
      {/each}
    </div>
  {/each}
  <form class="row">
    <Letterwise
      placeholder="word?"
      maxlength={1}
      {length}
      on:solve
      let:valid
      let:dispatch
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
      content: "❌\A➡️";
    }

    .clear {
      background-color: var(--black);


      &::after {
        content: "❌\A↘️";
        letter-spacing: -3px;
        white-space: pre;
      }
    }
  }

  button {
    width: 90%;
    height: 90%;
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
        content: "📝";
        font-size: 1.5em;
      }
    }
  }
</style>
