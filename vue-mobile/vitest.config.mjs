import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

/**
 * Mail vue-mobile is a module package (not a full Quasar app).
 * Unit tests live here next to Mail utils; Core aliases are not required for pure utils.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Allow imports like `utils/search-description` if needed later
      utils: path.resolve(root, 'utils'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['test/unit/**/*.{spec,test}.{js,mjs}'],
  },
})
