<script lang="ts">
  import { State, CSSState } from '../../utils/types';

  export let ter: string | null;
  export let state: State;
  export let defaultState: State;
  export let paintState: State;
  
  export let disabled = false;
  export let visible = true;
  $: visible = !!ter;

  function paint(e: MouseEvent) {
      if (e.buttons !== 1) {
          return;
      }
      state = paintState;
  }
</script>

<div class:disabled class={`tile ${CSSState[state || defaultState].toLowerCase()}`}
  on:mouseenter={paint}
  on:mousedown={paint}
  on:touchmove|preventDefault={() => { state = paintState; }}
>
  {#if visible}
    <!--let-->{ter}
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
</style>
