<script lang="ts">
  import { State, CSSState } from '../../utils/types';

  export let paintState: State = State.Right;
</script>

<section>
  {#each [1, 2, 3] as state}
    <input
      type="radio"
      name="color"
      title={`Color for a letter that's ${State[state].toLowerCase()}`}
      class={CSSState[state].toLowerCase()}
      on:change={() => paintState = state}
      checked
    >
    <!--
      that `checked` is a hack to default to selecting the last radio button
      (which is what happens if multiple buttons are `checked`)
      WITHOUT unnecessarily binding it to paintState or anything
    -->
  {/each}
</section>

<style lang="scss">
  p {
    text-align: center;
    text-transform: uppercase;
    color: var(--light-gray);
  }

  section {
    display: flex;
    justify-content: space-evenly;
  }

  input[type=radio] {
    flex-grow: 1;
    appearance: none;
    background: none;
    padding: 10px;
    box-shadow: black 0px 2px 3px 0px;
    color: var(--light-gray);
    text-align: center;
    text-transform: uppercase;

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

    &:after {
      content: '⚫';
      color: transparent;
      font-size: 2.5em;
    }

    &:checked:after {
      content: '🖌️';
      color: unset;
      font-size: 2.5em;
    }
  }
</style>
