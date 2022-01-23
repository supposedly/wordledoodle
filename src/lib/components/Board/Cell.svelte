<script lang="ts">
  import { State, CSSState } from '../../utils/types';
  import { FLIP_IN_DURATION, FLIP_OUT_DURATION } from '../../utils/constants';

  import { createEventDispatcher } from 'svelte';

  export let ter: string | null;
  export let state: State;
  export let defaultState: State;
  export let paintState: State;
  
  export let disabled = false;
  export let visible = false;

  let displayedLetter: string;
  let flipping = false;
  let letterTimeout: ReturnType<typeof setTimeout>;
  let flipTimeout: ReturnType<typeof setTimeout>;
  $: {
    if (ter === null) {
      // delete the letter instantly
      displayedLetter = '';
      visible = false;
    } else {
      // flip to change letters
      // (this branch is also triggered if ter === '')
      flipping = true;
  
      clearTimeout(letterTimeout);
      letterTimeout = setTimeout(() => {
        displayedLetter = ter || '';  // this entire block is reactive on `ter`
        visible = !!ter;
      }, FLIP_IN_DURATION);
  
      clearTimeout(flipTimeout);
      flipTimeout = setTimeout(() => {
        flipping = false;
      }, FLIP_IN_DURATION);
    }
  }

  function paint(e: MouseEvent) {
      if (e.buttons !== 1) {
          return;
      }
      state = paintState;
  } 
  
  const dispatcher = createEventDispatcher();
  const stateChange = () => dispatcher('statechange');

  $: state, stateChange();
</script>

<div
  class:disabled
  class:flipping
  class="tile {CSSState[state || defaultState].toLowerCase()}"
  style="--flip-in-duration: {FLIP_IN_DURATION}ms; --flip-out-duration: {FLIP_OUT_DURATION}ms"
  on:mouseenter={paint}
  on:mousedown={paint}
  on:touchmove|preventDefault={() => { state = paintState; }}
>
  {#if visible}
    {displayedLetter}
  {/if}
</div>

<style lang="scss">
  .tile {
    width: 100%;
    height: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 2rem;
    font-weight: bold;
    vertical-align: middle;
    box-sizing: border-box;
    /*color: var(--tile-text-color);*/
    color: var(--light-gray);
    text-transform: uppercase;
    user-select: none;
    border: 2px solid;

    transition: transform var(--flip-out-duration) ease-out, background-color 150ms, border-color 150ms;

    // animation
    transform: scaleY(100%);
    &.flipping {
      transition: transform var(--flip-in-duration) ease-in, background-color 150ms, border-color 150ms;
      transform: scaleY(0);
    }

    // colors
    &.empty {
      background-color: var(--black);
      border-color: var(--gray);
    }

    &.absent {
      background-color: var(--dark-gray);
      border-color: transparent;
    }

    &.present {
      background-color: var(--color-present);
      border-color: transparent;
    }

    &.correct {
      background-color: var(--color-correct);
      border-color: transparent;
    }

    &.disabled {
      pointer-events: none;
      opacity: 50%;
    }
  }
</style>
