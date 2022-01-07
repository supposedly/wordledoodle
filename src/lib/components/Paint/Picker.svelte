<script lang="ts">
  import { State } from '../../utils/enums';

  export let paintState: State = State.Empty;
</script>

<button on:click={() => paintState = State.Incorrect}></button>
<button on:click={() => paintState = State.Elsewhere}></button>
<button on:click={() => paintState = State.Correct}></button>
