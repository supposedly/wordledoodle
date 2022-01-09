<script lang="ts">
  import Toast from './Toast.svelte';
  import type { Toaster } from './toaster';

  export let toaster: Toaster<string>;

  // $: console.log($toaster);
</script>

<ol class="container">
  {#each $toaster as message}
    <li>
      <Toast>{message}</Toast>
    </li>
  {/each}
</ol>

<style lang="scss">
  .container {
    position: fixed;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    overflow: hidden;
    list-style-type: none;
    pointer-events: none;
    z-index: 2;
  }
</style>
