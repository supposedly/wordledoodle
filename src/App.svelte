<script lang="ts">
  import { Dictionary } from './lib/utils/search';

  import Game from './lib/components/Game.svelte';
  
  import { words, wordLength } from './assets/wordle.dictionary';
  import './assets/global.scss';

  const dictionary = new Dictionary(words, wordLength);
</script>

<Game {dictionary}/>

<!--
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
-->
