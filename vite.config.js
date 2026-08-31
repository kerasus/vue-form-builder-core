import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return {
      plugins: [vue()],
      root: 'dev'
    }
  }

  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        include: ['src/**/*.ts', 'src/**/*.vue']
      })
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueFormBuilderCore',
        fileName: (format) => `vue-form-builder-core.${format === 'es' ? 'js' : 'umd.cjs'}`
      },
      rollupOptions: {
        external: ['vue', 'shvl'],
        output: {
          globals: {
            vue: 'Vue',
            shvl: 'shvl'
          }
        }
      }
    }
  }
})
