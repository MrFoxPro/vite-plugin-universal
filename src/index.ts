import path from 'node:path'
import fs from 'node:fs/promises'
import { Plugin, ViteDevServer, createServer, ResolvedConfig, Logger, normalizePath } from 'vite'
import type { Options as SolidOptions } from 'vite-plugin-solid'

export type SolidCertainSSGPluginOptions = {
   /**
    * Achtung!
    * It should be same object (same ref) that was passed to solid configuration
    * Whis plugin changes setting to render specific pages in ssr mode:
    * https://github.com/solidjs/vite-plugin-solid/blob/master/src/index.ts#L377
    */
   solidPluginOptionsRef: Partial<SolidOptions>
   entries: {
      /**
       * Path to html page
       * @example blog/index.html
       */
      htmlPath: string

      /**
       * Path to entry file
       * which exports render hook
       * @example ./blog/blog.tsx
       */
      ssrEntry: string
      /**
       * Relative url to serve from (with or without .html)
       * @example
       * /blog
       * /blog/article.html
       */
      urlAlias: string

      /**
       * Path relative to outDir/ to place output (only with .html)
       * @example
       * /blog.html
       * /blog/article.html
       */
      outputPath?: string
   }[]
}

type NormalizedEntry = {
   htmlPath: string
   urlAlias: string
   outputPath: string
   ssrEntry: string
   renderedHTML?: string
}

export default function (options: SolidCertainSSGPluginOptions): Plugin {
   if (!options.solidPluginOptionsRef.solid) {
      options.solidPluginOptionsRef.solid = {
         hydratable: false,
      }
   }

   const _ssr = options.solidPluginOptionsRef.ssr
   const _hydratable = options.solidPluginOptionsRef.solid.hydratable

   let server: ViteDevServer
   let config: ResolvedConfig
   let logger: Logger
   const entries: NormalizedEntry[] = []
   const ssrOutlet = '<!--ssr-outlet-->' as const
   let resolvedRoot: string

   const rootAbs = (p: string) => path.resolve(resolvedRoot, p)
   const rootRel = (p: string) => path.relative(resolvedRoot, p)
   const comparePaths = (p1: string, p2: string) => {
      p1 = path.normalize(p1)
      p2 = path.normalize(p2)
      if (!path.isAbsolute(p1)) p1 = rootAbs(p1)
      if (!path.isAbsolute(p2)) p2 = rootAbs(p2)
      return p1 === p2
   }
   const prettifyPath = (p: string) => {
      if (path.isAbsolute(p)) p = rootRel(p)
      return normalizePath(p)
   }

   function setSSRMode(enable: boolean) {
      if (enable) {
         options.solidPluginOptionsRef.ssr = true
         options.solidPluginOptionsRef.solid!.hydratable = false
      } else {
         options.solidPluginOptionsRef.ssr = _ssr
         options.solidPluginOptionsRef.solid.hydratable = _hydratable
      }
   }

   async function getEntryFragment(entry: NormalizedEntry) {
      setSSRMode(true)
      const ssrMod = await server.ssrLoadModule(entry.ssrEntry, { fixStacktrace: true })
      setSSRMode(false)
      if (ssrMod.render?.constructor !== Function) {
         throw new Error(`SSG entry ${entry.ssrEntry} should provide 'render' export`)
      }
      const fragment = await ssrMod.render()
      return fragment
   }

   function createHandler(entry: NormalizedEntry) {
      return async (req, res, next) => {
         const url = new URL(req.originalUrl, `http://${req.headers.host}`)
         if (url.pathname !== entry.urlAlias) {
            return next()
         }
         let template = await fs.readFile(entry.htmlPath, 'utf-8')
         template = await server.transformIndexHtml(req.originalUrl, template)

         const fragment = await getEntryFragment(entry)

         template = template.replace(ssrOutlet, fragment)

         res.statusCode = 200
         res.setHeader('Content-Type', 'text/html')
         res.end(template)
      }
   }

   function configureServer(_server: ViteDevServer) {
      server = _server
      for (const entry of entries) {
         server.middlewares.use(entry.urlAlias, createHandler(entry))
      }
   }

   return {
      name: 'solid-ssg-pages',
      enforce: 'post',
      configureServer: {
         order: 'pre',
         handler: configureServer,
      },
      configResolved(_config) {
         config = _config
         logger = config.logger
         resolvedRoot = path.resolve(config.root)
         for (const entry of options.entries) {
            let outputPath = entry.outputPath
            if (!outputPath) {
               if (entry.urlAlias.endsWith('.html')) outputPath = entry.urlAlias
               else outputPath = entry.urlAlias + '.html'
            }
            entries.push({
               outputPath: rootAbs(path.resolve(config.build.outDir, entry.outputPath)),
               htmlPath: rootAbs(entry.htmlPath),
               urlAlias: entry.urlAlias,
               ssrEntry: entry.ssrEntry,
            })
         }
      },
      generateBundle(_, bundle) {
         const outputs = Object.entries(bundle)
         const unwantedChunks: string[] = []
         for (const [key, entry] of outputs) {
            if (entry.type == 'asset') {
               if (entry.source.constructor != String) continue
               const related = entries.find((e) => comparePaths(e.htmlPath, entry.fileName))
               if (related) {
                  related.renderedHTML = entry.source
                  unwantedChunks.push(key)
               }
               continue
            }
            if (!entry.facadeModuleId) continue
            if (entries.some((e) => comparePaths(e.htmlPath, entry.facadeModuleId))) {
               unwantedChunks.push(key)
            }
         }
         for (const key of unwantedChunks) {
            delete bundle[key]
            logger.info(`\n🔹 ${prettifyPath(key)} deleted from bundle`)
         }
         return
      },
      async writeBundle() {
         logger.info('🔹 Starting server to prerender static pages')
         server = await createServer().then((s) => s.listen(config.server?.port ?? 3000))
         for (const entry of entries) {
            const template = entry.renderedHTML
            if (!template) {
               logger.error(`Html wasn't found for ${prettifyPath(entry.htmlPath)}`)
               logger.error('Make sure you added it to build.rollupOptions.input')
               continue
            }
            const fragment = await getEntryFragment(entry)
            const html = template.replace(ssrOutlet, fragment)
            await fs.mkdir(path.dirname(entry.outputPath), { recursive: true })
            await fs.writeFile(entry.outputPath, html)
            logger.info(
               `🔹 Static page ${prettifyPath(entry.htmlPath)} saved to ${prettifyPath(entry.outputPath)}`
            )
         }
         await server.close()
      },
   }
}
