<script lang="ts">
import { createEventDispatcher } from "svelte";


  export let maxlength: number;
  export let placeholder: string;
  export let length: number;
  const answer: string[] = Array.from({length});
  let valid = false;

  const validPattern = /^[a-zA-Z]$/;

  $: valid = answer.every(letter => letter && validPattern.test(letter));

  function getNext(element: HTMLInputElement) {
    let next: ChildNode | null = element;
    do {
      next = next.nextSibling;
      if (next == null || next == undefined) {
        return null;
      }
    } while (!(next instanceof HTMLInputElement));
    return next;
  }

  function getPrev(element: HTMLInputElement) {
    let prev: ChildNode | null = element;
    do {
      prev = prev.previousSibling;
      if (prev == null || prev == undefined) {
        return null;
      }
    } while (!(prev instanceof HTMLInputElement));
    return prev;
  }

  function handleInput(e: Event & { data?: string }) {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }
    if (e.data !== undefined && !e.data) {
      return;
    }
    getNext(e.target)?.focus();
  }

  function handleNonInput(e: KeyboardEvent) {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }
    if (!e.target.value) {
      switch (e.key) {
        case 'Backspace': {
          const prev = getPrev(e.target);
          if (prev === null) {
            break;
          }
          prev.focus();
          // this interacts badly with svelte's reactivity, the bound values don't update :/
          /* prev.value = prev.value.slice(0, -1); */
          // workaround:
          if (prev.dataset.idx !== undefined) {
            answer[+prev.dataset.idx] = answer[+prev.dataset.idx].slice(0, -1);
          }
          e.preventDefault();
        }
        break;
        case 'Delete': {
          const next = getNext(e.target);
          if (next === null) {
            break;
          }
          next.focus();
          // ditto above :/
          /* next.value = next.value.slice(1); */
          if (next.dataset.idx !== undefined) {
            answer[+next.dataset.idx] = answer[+next.dataset.idx].slice(1);
          }
          e.preventDefault();
        }
        break;
      }
    }
    switch (e.key) {
      case 'ArrowLeft': {
        if (e.shiftKey) {
          break;
        }
        const pos = e.target.selectionStart;
        if (pos === null || pos > 0) {
          break;
        }
        const prev = getPrev(e.target);
        if (prev === null) {
          break;
        }
        prev.focus();
        /* prev.select(); */
        prev.setSelectionRange(prev.value.length, prev.value.length);
        e.preventDefault();
      }
      break;
      case 'ArrowRight': {
        if (e.shiftKey) {
          break;
        }
        const pos = e.target.selectionEnd;
        if (pos === null || pos < e.target.value.length) {
          break;
        }
        const next = getNext(e.target);
        if (next === null) {
          break;
        }
        next.focus();
        /* next.select(); */
        next.setSelectionRange(0, 0);
        e.preventDefault();
      }
      break;
      /*
      // if user inputs a char at end of a filled input square, replace the next square's value
      // COMMENTED OUT because it's inconsistent for now -- if the user inputs a char at
      // the beginning of a filled input square, the square's value stays as is
      default: {
        if (!validPattern.test(e.key)) {
          break;
        }
        if (
          !e.target.value
          || e.target.selectionEnd === null
          || e.target.selectionStart !== e.target.selectionEnd  // if there's an actual selection
          || e.target.selectionEnd < e.target.value.length  // if cursor is before end
        ) {
          break;
        }
        const next = getNext(e.target);
        if (next === null) {
          break;
        }
        next.focus();
        // ditto above :/
        if (next.dataset.idx !== undefined) {
          answer[+next.dataset.idx] = `${e.key}${answer[+next.dataset.idx].slice(1)}`;
        }
        e.preventDefault();
      }
      break;
      */
    }
  }

  const dispatcher = createEventDispatcher();
  const dispatch = () => dispatcher('solve', {answer: answer.join('')});
</script>

<!-- submit button -->
<slot {valid} {dispatch}></slot>

{#each placeholder as letter, idx}
  <input type="text" {maxlength} placeholder={letter} pattern="[a-zA-Z]"
    data-idx={idx}
    bind:value={answer[idx]}
    on:input={handleInput}
    on:keydown={handleNonInput}
  >
{/each}

<style lang="scss">
  input {
    width: 90%;
    height: 90%;
    border-radius: 5px;
    border: none;
    box-shadow: inset var(--black) 0px 0px 3px 0px;
    background-color: var(--white);
    text-align: center;
    color: var(--dark-gray);
    font-size: 1.5em;
      text-transform: uppercase;
      font-weight: bold;

    &::placeholder {
      opacity: 60%;
    }
  }
</style>
