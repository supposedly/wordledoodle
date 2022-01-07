<script lang="ts">
  import { State } from '../../utils/enums';
  import Cell from './Cell.svelte';
  type Letter = {state: State, value: string | null};

  export let length = 5;
  export let height = 6;
  export let paintState: State;
  let highestEmptyRow: number = 0;
  let answer: string[] = Array.from({length: 5});

  export const patterns: Letter[][] = Array.from(
    {length: height},
    _ => Array.from({length}, _ => ({state: State.Empty, value: null}))
  );

  $: {
    let i: number;
  
    for (i = 0; i < patterns.length; i++) {
      if (patterns[i].every(letter => letter.state == State.Empty)) {
        break;
      }
    }
    highestEmptyRow = i;

    for (i = patterns.length - 1; i > 0; i--) {
      if (i > highestEmptyRow) {
        patterns[i].forEach(letter => letter.state = State.Empty);
        patterns[i] = patterns[i];
      }
    }
  }

  function updateRow(word: Letter[]) {
    word.forEach(letter => letter.state = State.Empty);
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
    <div class="row" style={row > highestEmptyRow ? "opacity: 50%; pointer-events: none;" : ""}>
      <button on:click={() => word = updateRow(word)}></button>
      {#each word as letter}
        <Cell
          bind:state={letter.state}
          bind:ter={letter.value}
          defaultState={row < highestEmptyRow ? State.Incorrect : State.Empty}
          paintState={paintState}
        />
      {/each}
    </div>
  {/each}
  <form class="row">
    <button on:click|preventDefault></button>
    {#each "word?" as letter, idx}
      <input type="text" maxlength="1" placeholder={letter} bind:value={answer[idx]}>
    {/each}
  </form>
</div>

<style lang="scss">
  .board {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-gap: 5px;
    padding: 10px;
    box-sizing: border-box;
  }
  
  .row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 5px;
  }

  form.row {
    input, button {
      width: 90%;
      height: 90%;
      border-radius: 5px;
      text-align: center;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 1.5em;
      background-color: var(--light-gray);
    }

    input {
      border: none;
      box-shadow: inset var(--black) 0px 0px 4px 0px;
    }
  }
</style>
