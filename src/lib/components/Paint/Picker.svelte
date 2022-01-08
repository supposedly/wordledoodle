<script lang="ts">
  import { State, CSSState } from '../../utils/enums';

  export let paintState: State = State.Empty;

  function getState(state: number) {
    // this stops syntax highlighting from breaking in vscode...
    return State[state];
  }
</script>

these buttons are ugly i'm going to fix them
{#each [1, 2, 3] as state}
  <button class={CSSState[state].toLowerCase()} on:click={() => paintState = state}>
    {getState(state)}
  </button>
{/each}

<style lang="scss">
  button {
    height: 100%;
    width: 100%;
  }

  section {
    height: 50px;
  }

  button {
    border-radius: 5px;
    box-shadow: black 0px 2px 3px 0px;
    font-weight: bold;
    color: var(--light-gray);
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
  }
</style>
