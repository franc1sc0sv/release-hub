import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@release-hub/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@release-hub/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
    },
  },
  esbuild: {
    target: 'es2021',
  },
})
