<script lang="ts">
  import Toast from "./Toast.svelte";
  import type { ToastQueue } from "./toastQueue";

  export let toaster: ToastQueue<string>;

  let movingUp: boolean;
  $: movingUp = $toaster[0] && $toaster[0].dequeuing;
</script>

<ol class="container">
  {#each $toaster as toast, idx (idx)}
    <Toast {movingUp}>{@html toast.item}</Toast>
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
