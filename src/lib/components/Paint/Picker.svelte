<script lang="ts">
  import { State, CSSState } from "../../utils/types";

  export let paintState: State = State.Right;

  export let highContrast = false;
  export let lightTheme = false; // not implementing this because it doesn't affect the grid colors
  // (even on Wordle itself, it only changes black cells to white in the shared emoji thing, not the actual site's grid)

  const paintStates = [State.Right, State.Elsewhere, State.Wrong];
</script>

<section>
  <input
    type="checkbox"
    class="like-button"
    id="high-contrast"
    title="Toggle high-contrast colors"
    bind:checked={highContrast}
  />
  <label for="high-contrast" title="Toggle high-contrast colors" />
  {#each paintStates as state}
    <input
      type="radio"
      class="like-button {CSSState[state].toLowerCase()}"
      name="color"
      title={`Color for a letter that's ${State[state].toLowerCase()}`}
      checked={state === State.Right}
      on:change={() => (paintState = state)}
    />
    <!-- i don't know why specifying `checked` that way works... -->
  {/each}
  <input
    type="checkbox"
    class="like-button"
    id="light-theme"
    title="Toggle light-theme colors"
    bind:checked={lightTheme}
  />
  <label for="light-theme" title="Toggle light-theme colors" />
</section>

<style lang="scss">
  #high-contrast {
    & + label::after {
      content: "🎨";
    }

    & + label::before {
      display: block;
      content: "\A🎨\A";
      white-space: pre;
      opacity: 0;
      height: 0;
      pointer-events: none;
    }

    &:checked + label::after {
      filter: hue-rotate(200deg) contrast(1.2);
    }
  }

  #light-theme {
    & + label::after {
      content: "💡";
    }

    & + label::before {
      display: block;
      content: "\A💡\A";
      white-space: pre;
      opacity: 0;
      height: 0;
      pointer-events: none;
    }

    &:not(:checked) + label::after {
      filter: invert(1) grayscale(1) brightness(2) contrast(4);
    }
  }

  input[type="checkbox"].like-button ~ label {
    align-self: center;
    background-color: var(--black);
    margin: {
      left: 5px;
      right: 5px;
    }
    padding: 5px {
      top: 0px;
      bottom: 4px;
    }
  }

  section {
    display: flex;
    justify-content: space-evenly;
    margin: 5px;
  }

  input[type="radio"].like-button {
    &:not(:active) {
      // the special classes svelte adds make this override global.css's
      // inset box-shadow without the :not(:active)
      box-shadow: black 0px 2px 3px 0px;
    }
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    background: none;
    padding: 10px;
    color: var(--light-gray);
    text-align: center;
    text-transform: uppercase;

    &.empty {
      background-color: var(--black);
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

    &:after {
      content: "⚫";
      color: transparent;
      font-size: 2.5em;
    }

    &:checked:after {
      content: "🖌️";
      color: unset;
      font-size: 2.5em;
    }

    &:active {
      font-size: 0.8em;
    }
  }
</style>
