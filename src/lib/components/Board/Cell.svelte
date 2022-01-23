<script lang="ts">
  import { State, CSSState } from '../../utils/types';
  import { FLIP_DURATION } from '../../utils/constants';

  import { createEventDispatcher } from 'svelte';

  export let ter: string;
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
    flipping = true;

    clearTimeout(letterTimeout);
    letterTimeout = setTimeout(() => {
      displayedLetter = ter;  // this entire block is reactive on `ter`
      visible = !!displayedLetter;
    }, FLIP_DURATION);

    clearTimeout(flipTimeout);
    flipTimeout = setTimeout(() => {
      flipping = false;
    }, FLIP_DURATION);
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
  style="--flip-duration: {FLIP_DURATION}ms"
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

    transition: background-color, border-color;
    transition-duration: 150ms;

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

  // animation
  .tile {
    transition: transform;
    transition-duration: 200ms;
    transition-timing-function: ease-out;
    transform: scaleY(100%);

    &.flipping {
      transition-timing-function: ease-in;
      transition-duration: 100ms;
      transform: scaleY(0);
    }
  }
</style>
