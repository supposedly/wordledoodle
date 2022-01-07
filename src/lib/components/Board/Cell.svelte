<script lang="ts">
    import type { State } from '../../utils/enums';

    export let ter: string | null;
    export let state: State;
    export let defaultState: State;
    export let paintState: State;

    function paint(mouseEvent: MouseEvent) {
        if (mouseEvent.buttons !== 1) {
            return;
        }
        state = paintState;
    }

    const cssState = Object.freeze([
        'empty',
        'absent',
        'present',
        'correct'
    ]);
</script>

<div class={`tile ${cssState[state || defaultState]}`} on:mouseenter={paint} on:mousedown={paint}>
    <!--let-->{ter || ''}
</div>

<style lang="scss">
    .tile {
        width: 100%;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
        line-height: 2rem;
        font-weight: bold;
        vertical-align: middle;
        box-sizing: border-box;
        /*color: var(--tile-text-color);*/
        color: var(--light-gray);
        text-transform: uppercase;
        user-select: none;
        border: 2px solid;

        transition: background-color, border-color;
        transition-duration: 150ms;

        &.empty {
            background-color: var(--black);
            border-color: var(--gray);
        }

        &.absent {
            background-color: var(--dark-gray);
            border-color: transparent;
        }

        &.present {
            background-color: var(--color-present);
            border-color: transparent;
        }

        &.correct {
            background-color: var(--color-correct);
            border-color: transparent;
        }
    }
</style>
