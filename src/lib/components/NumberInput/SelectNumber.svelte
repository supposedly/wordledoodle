<script lang="ts">
  export let highNumber: number;
</script>

<!-- <section>
  <div>
    {#each [highNumber - 2, highNumber - 1, highNumber] as number}
      <button class:emphasized={number === highNumber}>
        <span>{number ? number : "..."}</span>
      </button>
    {/each}
  </div>
</section> -->
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
