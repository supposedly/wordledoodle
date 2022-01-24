<script lang="ts">
  import { TODAYS_WORDLE } from '../..//utils/constants';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let index = TODAYS_WORDLE;
  export let hidden = false;

  function goBack() {
    index--;
    hidden = (index >= TODAYS_WORDLE);
    dispatch('use', {index, hidden});
  }

  function middleButton() {
    hidden = !hidden;
    index = TODAYS_WORDLE;
    dispatch('use', {index, hidden});
  }

  function goForward() {
    index++;
    hidden = (index >= TODAYS_WORDLE);
    dispatch('use', {index, hidden});
  }
</script>

<section>
  <div>
    <button on:click={goBack} title="Use previous day's wordle">◀️</button>
    <button
      on:click={middleButton}
      title={hidden ? "Unhide today's wordle" : "Use today's wordle"}
    >
      {#if hidden} 👁️ {:else} 📆 {/if}
    </button>
    <button on:click={goForward} disabled={index >= TODAYS_WORDLE}>▶️</button>
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  div {
    display: block;
    height: 100%;
  }

  button {
    height: 100%;
    margin: {
      left: 5px;
      right: 5px;
    }
    cursor: pointer;
    font-weight: bold;
    font-size: medium;
    
    &:active {
      font-size: small;
    }

    span {
      display: block;
      opacity: 80%;
      transform: scaleY(0.85);
    }

    &.emphasized {
      > span {
        opacity: 100%;
      }

      > span::after {
        content: " (spoilers!)";
        white-space: pre;
        color: #ff3333;
        display: inline-block;
        transform: scaleY(1.2);
        font-size: small;
      }
    }
  }
</style>
