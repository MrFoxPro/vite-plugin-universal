import path from 'node:path'
import type { ConfigEnv, UserConfig } from 'vite'
import solid, { Options as SolidOptions } from 'vite-plugin-solid'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import solidSsgPages from '../src/index'

export default async ({ mode }: ConfigEnv) => {
   const dev = mode === 'development'

   const solidOptions: Partial<SolidOptions> = {
      hot: dev,
      dev: dev,
      extensions: ['.md', '.mdx'],
      ssr: true,
   }
   const config: UserConfig = {
      base: dev ? './' : '/',
      publicDir: false,
      plugins: [
         {
            ...mdx({
               jsx: true,
               jsxImportSource: 'solid-js',
               providerImportSource: 'solid-mdx',
               remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
            }),
            enforce: 'pre',
         },
         solid(solidOptions),
         solidSsgPages({
            entries: [
               {
                  htmlPath: './blog/blog.html',
                  ssrEntry: './blog/blog.tsx',
                  urlAlias: '/blog',
                  outputPath: './blog.html',
               },
            ],
            solidPluginOptionsRef: solidOptions,
         }),
      ],
      build: {
         outDir: './dist',
         polyfillModulePreload: false,
         sourcemap: false,
         target: 'esnext',
         minify: 'esbuild',
         reportCompressedSize: true,
         emptyOutDir: true,
         cssCodeSplit: true,
         rollupOptions: {
            input: {
               app: './index.html',
               blog: './blog/blog.html',
            },
            output: {
               // manualChunks: {
               // solid: ['solid-js'],
               // },
               // entryFileNames: '[name].js',
               // chunkFileNames: '[name].js',
               // assetFileNames: 'assets/[name].[ext]',
               validate: !dev,
            },
         },
      },
      css: {
         modules: false,
      },
      resolve: {
         alias: [
            {
               find: '@',
               replacement: path.resolve(__dirname, './'),
            },
         ],
      },
   }
   return config
}
