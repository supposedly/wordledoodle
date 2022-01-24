<script lang="ts">
  import { State, CSSState } from '../../utils/types';
  import {
    FLIP_IN_DURATION,
    FLIP_OUT_DURATION,
    FLIP_OUT_DELAY,
  } from '../../utils/constants';

  import { createEventDispatcher } from 'svelte';

  export let ter: string | null;
  export let state: State;
  export let defaultState: State;
  export let paintState: State;
  export let flipDelay: number;
  
  export let disabled = false;

  let displayedLetter: string;
  let flipping = false;
  let letterTimeout: ReturnType<typeof setTimeout>;
  let flipTimeout: ReturnType<typeof setTimeout>;
  $: {
    if (ter === null || disabled) {
      // delete the letter instantly
      displayedLetter = '';
    } else {
      // flip to change letters
      // (this branch is also triggered if ter === '')
      flipping = true;
  
      clearTimeout(letterTimeout);
      letterTimeout = setTimeout(() => {
        displayedLetter = ter || '';  // this entire block is reactive on `ter`
      }, FLIP_IN_DURATION + flipDelay + FLIP_OUT_DELAY);
  
      clearTimeout(flipTimeout);
      flipTimeout = setTimeout(() => {
        flipping = false;
      }, FLIP_IN_DURATION + flipDelay + FLIP_OUT_DELAY);
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
  on:mouseenter={paint}
  on:mousedown={paint}
  on:touchmove|preventDefault={() => { state = paintState; }}
  style="
    --flip-out-duration: {FLIP_OUT_DURATION}ms;
    --flip-out-delay: {FLIP_OUT_DELAY}ms;
    --flip-in-duration: {FLIP_IN_DURATION}ms;
    --flip-in-delay: {flipDelay}ms;
  "
>
  {#if displayedLetter && displayedLetter !== '\u200b'}
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

    transition: transform var(--flip-out-duration) ease-out var(--flip-out-delay),
      background-color var(--color-change-duration),
      border-color var(--color-change-duration);

    // animation
    transform: scaleY(100%);
    &.flipping {
      transition: transform var(--flip-in-duration) var(--flip-in-delay) ease-in,
        background-color var(--color-change-duration),
        border-color var(--color-change-duration);
      transform: scaleY(0);
    }
    

    // colors
    &.empty {
      background-color: var(--bg-color);
      border-color: var(--gray);
    }

    &.absent {
      background-color: var(--color-absent);
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
