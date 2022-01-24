/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '*.dictionary';  // see vite.config.js for transformer/loader

declare module 'array-keyed-map' {
  // TODO: fill this in maybe
  export default class ArrayKeyedMap {}
}
