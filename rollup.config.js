import strip from '@rollup/plugin-strip'
import babel from '@rollup/plugin-babel'
import del from 'rollup-plugin-delete'

/** @type {import('rollup').OutputOptions} */
const output = {}
/** @type {import('rollup').RollupOptions} */
const config = {
   input: './src/index.ts',
   external: ['vite', 'node:path', 'node:fs/promises'],
   treeshake: 'smallest',
   output: [
      {
         ...output,
         format: 'es',
         dir: 'dist/es',
      },
      {
         ...output,
         format: 'cjs',
         dir: 'dist/cjs',
      },
   ],
   plugins: [
      strip({
         include: /\.(js|mjs|ts|tsx|jsx)/,
      }),
      babel({
         extensions: ['.ts'],
         babelHelpers: 'bundled',
         presets: ['@babel/preset-typescript'],
         exclude: /node_modules\//,
      }),
      del({ targets: 'dist/*' }),
   ],
}
export default config
