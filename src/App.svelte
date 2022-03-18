<script lang="ts">
  import { Dictionary } from "./lib/utils/search";

  import Game from "./lib/components/Game.svelte";

  import { words, lastWordIndex, wordLength } from "./assets/wordle.dictionary";
  import "./assets/global.scss";

  const dictionary = new Dictionary(wordLength, words, lastWordIndex);
</script>

<Game {dictionary} />
