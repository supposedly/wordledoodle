import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

function toExports(values) {
  return Object.entries(values)
    .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`)
    .join(' ');
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/wordledoodle/',
  plugins: [
    svelte(),
    {
      name: `dictionary-loader`,
      transform(src, id) {
        if (/\.dictionary$/.test(id)) {
          const [alphabet, wordLengthStr, lastWordIndexStr, ...words] = src.trim().split(/\s+/);
          const wordLength = +wordLengthStr, lastWordIndex = +lastWordIndexStr;
          // (wordLength more like wordleNgth amirite)
          return {
            code: toExports({wordLength, alphabet, lastWordIndex, words})
          };
        }
      }
    }
  ]
})
