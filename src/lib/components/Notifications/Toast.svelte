<script lang="ts">
  import { fade } from 'svelte/transition';

  export let movingUp: boolean = false;
</script>

<li in:fade class:movingUp>
  <slot></slot>
</li>

<style lang="scss">
  li {
    position: relative;
    background-color: var(--white);
    font-size: 16px;
    opacity: 80%;
    font-weight: bold;
    text-align: center;
    border-radius: 4px;
    padding: 16px;
    margin: 16px;

    top: 0;
  }
  
  .movingUp {
    transition: transform 200ms, top 200ms;
    // top: -80px;
    transform: translateY(-80px);
  }
</style>
