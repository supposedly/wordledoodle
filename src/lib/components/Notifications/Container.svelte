<script lang="ts">
  import { fly } from 'svelte/transition';
  import Toast from './Toast.svelte';
  import type { Toaster } from './toaster';

  export let toaster: Toaster<string>;

  let movingUp: boolean;
  $: movingUp = $toaster[0] && $toaster[0].dequeuing;

</script>

<ol class="container">
  {#each $toaster as toast, idx (idx)}
    <Toast {movingUp}>{toast.item}</Toast>
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
