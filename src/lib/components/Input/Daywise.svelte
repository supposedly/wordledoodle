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
  <button
    on:click={goBack}
    title="Use previous day's wordle"
    disabled={index <= 0}
  >◀️</button>

  <button
    on:click={middleButton}
    title={hidden ? "Reveal today's wordle" : "Use today's wordle"}
  >
    {#if hidden} 👁️ {:else} 📆 {/if}
  </button>

  <button
    on:click={goForward}
    title="Use next day's wordle"
    disabled={index >= TODAYS_WORDLE}
  >▶️</button>
</section>

<style lang="scss">
  section {
    flex-grow: 2;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;

    height: 6vh;
    width: 6vh;
    border-radius: 50%;
    margin: {
      left: 1vw;
      right: 1vw;
    }
    cursor: pointer;
    font-weight: bold;
    
  }

  button {
    font-size: large;
    
    &:active {
      font-size: small;
    }

    @media screen and (max-height: 400px) {
      font-size: small;

      &:active {
        font-size: xx-small;
      }
    }
  }
</style>
