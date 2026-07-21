import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      utils: path.resolve(root, 'utils'),
      'src/utils/types': path.resolve(root, 'test/unit/stubs/types.js'),
      'src/utils/text': path.resolve(root, 'test/unit/stubs/text.js'),
      'src/utils/date': path.resolve(root, 'test/unit/stubs/date.js'),
      'boot/i18n': path.resolve(root, 'test/unit/stubs/i18n.js'),
      // sending.js imports local html-for-editor — stub via explicit path match in tests if needed
    },
  },
  plugins: [
    {
      name: 'stub-html-for-editor',
      enforce: 'pre',
      resolveId (id, importer) {
        if (
          importer &&
          importer.includes(`${path.sep}sending.js`) &&
          (id === './html-for-editor' || id.endsWith('/html-for-editor'))
        ) {
          return path.resolve(root, 'test/unit/stubs/html-for-editor.js')
        }
      },
    },
  ],
  test: {
    environment: 'node',
    globals: true,
    include: ['test/unit/**/*.{spec,test}.{js,mjs}'],
  },
})
