import path from 'node:path'

import ViteSolid from 'vite-plugin-solid'
import type { ConfigEnv, UserConfig } from 'vite'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkFrontmatter from 'remark-frontmatter'
import RollupMdx from '@mdx-js/rollup'
import VitePluginCivet from 'vite-plugin-civet'
import VitePluginInspect from 'vite-plugin-inspect'

import ViteUniversalPlugin from '../index'
export default async ({ mode }: ConfigEnv) => {
   const dev = mode === 'development'

   const config: UserConfig = {
      appType: 'custom',
      base: '/',
      server: {
         port: 3000,
      },
      preview: {
         port: 3000,
      },
      plugins: [
         {
            ...RollupMdx({
               jsx: true,
               jsxImportSource: 'solid-js',
               providerImportSource: 'solid-mdx',
               development: dev,
               remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
            }),
            enforce: 'pre',
         },
         VitePluginCivet({
            stripTypes: false,
            outputExtension: 'tsx',
            outputTransformerPlugin: 'solid',
         }),
         ViteSolid({
            hot: dev,
            dev: dev,
            extensions: ['.md', '.mdx', '.ts', '.tsx'],
            ssr: true,
         }),
         ViteUniversalPlugin<{ head: string[]; body: string[] }>({
            entries: [
               {
                  ssrEntry: 'blog/blog.tsx',
                  templatePath: 'blog/blog.html',
                  urlAlias: '/blog',
                  outputPath: 'blog.html',
               },
               {
                  ssrEntry: 'civet/entry.civet',
                  templatePath: 'civet/civet.html',
                  outputPath: 'nested/civet.html',
               },
               {
                  templatePath: 'app/app.html',
                  urlAlias: '/',
                  outputPath: 'index.html',
                  isFallback: true,
               },
            ],
            applyOutput({ head, body }, template) {
               return template.replace('<!--head-->', head.join('\n')).replace('<!--body-->', body.join('\n'))
            },
         }),
         VitePluginInspect(),
      ],
      build: {
         outDir: './dist',
         target: 'esnext',
         emptyOutDir: true,
         cssCodeSplit: true,
         modulePreload: {
            polyfill: false,
         },
         rollupOptions: {
            output: {
               entryFileNames: `[name].js`,
               chunkFileNames: `assets/[name].js`,
               assetFileNames: `assets/[name].[ext]`,
            },
         },
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
