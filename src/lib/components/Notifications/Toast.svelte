<script lang="ts">
  import { fade } from 'svelte/transition';
</script>

<li transition:fade>
  <slot></slot>
</li>

<style lang="scss">
  li {
    background-color: var(--white);
    font-size: 16px;
    opacity: 80%;
    font-weight: bold;
    text-align: center;
    border-radius: 4px;
    padding: 16px;
    margin: 16px;
  }
</style>
