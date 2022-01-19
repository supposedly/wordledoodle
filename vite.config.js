import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/wordledoodle/',
  plugins: [
    svelte(),
    {
      name: `dictionary-loader`,
      transform(src, id) {
        if (/\.dictionary$/.test(id)) {
          return {
            code: `export default ${JSON.stringify(src.trim().split(' '))};`
          };
        }
      }
    }
  ]
})
