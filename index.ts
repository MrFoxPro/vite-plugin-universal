import { Transform } from 'node:stream'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { Console } from 'node:console'
import type { Plugin, ViteDevServer, ResolvedConfig, Connect, Rollup } from 'vite'
import { createLogger, createServer, normalizePath } from 'vite'
import { glob } from 'glob'

type Entry<TOutput> = {
   /**
    * Path to html template relative from project root
    * @example blog/index.html
    */
   templatePath: string
   /**
    * Path to entry file from project root
    * which exports ```output: TOutput``` hook
    * @example ./blog/blog.page.tsx
    */
   ssrEntry?: string
   /**
    * Path relative from outDir to place output (only with .html)
    * @example
    * blog.html
    * blog/article.html
    */
   outputPath: string
   /**
    * Relative url to serve from (with or without .html)
    * If omitted, outputPath and dirname(outputPath) will be used
    * @example
    * /blog
    * /blog/article.html
    */
   urlAlias?: string
   /**
    * Apply output to template
    */
   applyOutput?: (output: TOutput, template: string) => string | Promise<string>

   /**
    * Show when route wasn't found (404)
    */
   isFallback?: boolean

   /**
    * Custom metadata you can pass to entry
    */
   meta?: any
}
export type EntryConfiguration<T> = Omit<Entry<T>, 'ssrEntry'> & {}
export type UniversalPluginOptions<TOutput> = {
   /**
    *
    * @param entry entry specified in options.entries
    * @returns
    */
   ssrEntryTransformHook?: (
      ctx: Rollup.PluginContext,
      server: ViteDevServer,
      entry: Entry<TOutput>,
      // IDK how to infer this cringy Vite type
      ...viteOptions: [
         code: string,
         id: string,
         options?: {
            ssr?: boolean
         }
      ]
   ) => Rollup.TransformResult | Promise<Rollup.TransformResult>

   /**
    * Entries that will be loaded in SSR mode to render them in HTML
    * Provide **glob** to search entries
    * Or list them manually
    * `**.page.{ts,tsx,mts}`
    */
   entries: string | Entry<TOutput>[]
   /**
    * Render entry output to template
    *
    * Will be replaced by entry renderResult if specified
    */
   applyOutput?: (renderResult: TOutput, template: string) => string | Promise<string>

   /**
    * Wether not to delete HTML produced by Vite at build time
    */
   keepOriginalHtml?: boolean
}

export default function <TOutput = unknown>(options: UniversalPluginOptions<TOutput>): Plugin {
   type NormalizedEntry<T = TOutput> = Required<Omit<Entry<T>, "meta">> & { transformedHtml?: string, meta?: any }

   const entries: NormalizedEntry[] = []
   const name = 'plugin-universal'
   const logger = createCustomLogger()

   let server: ViteDevServer
   let config: ResolvedConfig
   let root: string

   function createCustomLogger() {
      const ts = new Transform({
         transform(chunk, enc, cb) {
            cb(null, chunk)
         },
      })
      const fakeConsole = new Console({ stdout: ts })
      const logger = createLogger('info', { prefix: '🔹 ' })
      ;['info', 'warn', 'warnOnce', 'error'].forEach(method => {
         const original = logger[method]
         logger[method] = (msg, ...args) => original(`🔹 ${msg}`, ...args)
      }) // { prefix } doesn't work for some reason. Seems like Vite issue
      return Object.assign(logger, {
         table(data: any, indexName: string, properties?: readonly string[]) {
            fakeConsole.table(data, properties)
            console.log((ts.read() ?? '').toString().replace('(index)', indexName))
         },
      })
   }

   const rootAbs = (p: string) => path.resolve(root, p)
   const rootRel = (p: string) => path.relative(root, p)
   const comparePaths = (p1: string, p2: string) => {
      p1 = path.normalize(p1)
      p2 = path.normalize(p2)
      if (!path.isAbsolute(p1)) p1 = rootAbs(p1)
      if (!path.isAbsolute(p2)) p2 = rootAbs(p2)
      return p1 === p2
   }
   const prettifyPath = (p: string) => {
      if (path.isAbsolute(p)) p = rootRel(p)
      return '/' + normalizePath(p)
   }

   async function loadEntryOutput({ ssrEntry }: NormalizedEntry) {
      let mod: any
      try {
         mod = await server.ssrLoadModule(ssrEntry + '?' + name, { fixStacktrace: true })
      } catch (e) {
         return e
      }
      if (!mod.default) {
         const message = `Entry ${ssrEntry} should provide 'default' export. Available exports: ${Object.keys(
            mod
         )}`
         logger.error(message)
         const error = new Error(message)
         return error
      }
      const config = mod.default
      let output: TOutput
      try {
         output = (await config.output()) as TOutput
      } catch (e) {
         return e
      }
      return output
   }
   return {
      name,
      enforce: 'post',
      configureServer(_server) {
         server = _server
         function createHandler(entry: NormalizedEntry | '404'): Connect.NextHandleFunction {
            return async function PluginUniversalMiddleware(req, res, next) {
               let target: NormalizedEntry
               if (entry !== '404') {
                  target = entry
               } else {
                  const fallbackPage = entries.find(e => e.isFallback)
                  if (!fallbackPage) {
                     logger.warn('There is no 404 page. Consider adding it')
                     return next()
                  }
                  target = fallbackPage
               }
               let template = await fs.readFile(target.templatePath, 'utf-8')
               template = await server.transformIndexHtml(req.originalUrl, template)
               if (!target.ssrEntry) {
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'text/html')
                  return res.end(template)
               }
               const fragment = await loadEntryOutput(target)
               if (fragment instanceof Error) {
                  return next(fragment)
               }
               const html = await target.applyOutput(fragment, template)
               if (req.headers.referer) {
                  req.url = path.join(new URL(req.headers.referer).pathname, req.url)
               }
               res.statusCode = 200
               res.setHeader('Content-Type', 'text/html')
               res.end(html)
            }
         }
         return () => {
            for (const entry of entries) {
               server.middlewares.use(entry.urlAlias, createHandler(entry))
            }
            server.middlewares.use(createHandler('404'))
         }
      },
      async configResolved(_config) {
         config = _config
         if(!path.isAbsolute(config.base)) {
            logger.error('config.base is not absolute path! THis plugin can produce correct output only if config.base is absolute path.')
            logger.error('Also, make sure all script sources are defined as absolute paths in your HTML entries.')
            return
         }
         root = path.resolve(config.root)
         options.entries ??= './**/*.page.{ts,tsx,mts}'
         const rawEntries: Entry<TOutput>[] = []

         if (typeof options.entries == 'string') {
            const files = await glob(options.entries, {
               ignore: ['node_modules', '.git', 'dist'],
               nodir: true,
            })

            for (const file of files) {
               const entry = await server
                  .ssrLoadModule(file + '?' + name)
                  .then(r => r.default as Entry<TOutput>)
               if (!entry) {
                  logger.error(`Couldn't load entry ${file}. Make sure it has "default" export`)
                  continue
               }
               rawEntries.push({
                  ...entry,
                  ssrEntry: file,
               })
            }
         } else rawEntries.push(...options.entries)

         for (const entry of rawEntries) {
            if (!entry.urlAlias) {
               entry.urlAlias = prettifyPath(entry.outputPath.replace('index.html', '').replace('.html', ''))
            }
            let outputPath = entry.outputPath
            if (!outputPath) {
               if (entry.urlAlias.endsWith('.html')) outputPath = entry.urlAlias
               else outputPath = entry.urlAlias + '.html'
            }
            if (!entry.applyOutput && !options.applyOutput) {
               logger.warn(`\`renderResult\` was not specified for ${entry.ssrEntry}. Ignoring this page`)
               continue
            }
            entries.push({
               ...entry,
               ssrEntry: entry.ssrEntry ? rootAbs(entry.ssrEntry) : null,
               urlAlias: entry.urlAlias,
               templatePath: rootAbs(entry.templatePath),
               applyOutput: entry.applyOutput ?? options.applyOutput,
               outputPath: rootAbs(path.resolve(config.build.outDir, entry.outputPath)),
               isFallback: !!entry.isFallback,
            })
         }
         if (entries.filter(e => e.isFallback).length > 1) {
            logger.warn('Multiple pages are configured as fallback')
         }
         const tableToPrint = entries.reduce((acc, el) => {
            const alias = el.ssrEntry ? prettifyPath(el.ssrEntry) : '(missing)'
            return {
               ...acc,
               [alias]: {
                  url: el.urlAlias,
                  template: prettifyPath(el.templatePath),
                  output: prettifyPath(el.outputPath),
               },
            }
         }, {})
         logger.table(tableToPrint, ' entry ')
      },
      async buildStart(opts) {
         if (server) {
            return
         }
         const viteIndexHtmlPath = rootAbs('index.html')
         if (Array.isArray(opts.input)) {
            for (let i = 0; i < opts.input.length; i++) {
               if (!existsSync(opts.input[i])) {
                  if (opts.input[i] != viteIndexHtmlPath) {
                     logger.warn(`Removed input ${opts.input[i]} as it doesn't exist`)
                  }
                  opts.input.splice(i, 1)
               }
            }
            const targets = new Set(opts.input)
            for (const entry of entries) {
               targets.add(entry.templatePath)
            }
            opts.input.push(...Array.from(targets))
         } else {
            const inputs = Object.entries(opts.input)
            for (const [key, input] of inputs) {
               if (!existsSync(input)) {
                  if (input != viteIndexHtmlPath) {
                     logger.warn(`Removed input ${input} as it doesn't exist`)
                  }
                  delete opts.input[key]
               }
            }
            for (const entry of entries) {
               if (inputs.some(([key, input]) => input == entry.templatePath)) continue
               const inputKey = !entry.ssrEntry
                  ? prettifyPath(entry.templatePath)
                  : prettifyPath(entry.ssrEntry)
               opts.input[inputKey] = entry.templatePath
            }
         }
         logger.info('Starting server to prerender static pages')
         server = await createServer({
            // @ts-ignore Ensure we will not listen server
            server: false,
         })
      },
      transform: {
         order: 'pre',
         async handler(code, url, opts) {
            const [id, qs] = url.split('?')
            if (!qs?.includes('plugin-universal')) return null
            if (!options.ssrEntryTransformHook) {
               return null
            }
            const entry = entries.find(e => e.ssrEntry === id)
            const result = await options.ssrEntryTransformHook(this, server, entry, code, id, opts)
            return result
         },
      },
      generateBundle(_, bundle) {
         const outputs = Object.entries(bundle)
         for (const [key, entry] of outputs) {
            if (entry.type != 'asset') continue
            if (typeof entry.source != 'string') continue

            const related = entries.find(e => comparePaths(e.templatePath, entry.fileName))
            if (!related) continue

            related.transformedHtml = entry.source
            if (!options.keepOriginalHtml) {
               delete bundle[key]
            }
         }
      },
      async writeBundle() {
         for (const entry of entries) {
            const template = entry.transformedHtml
            if (!template) {
               logger.error(`Output HTML wasn't found for ${prettifyPath(entry.templatePath)}`)
               continue
            }
            let html = template
            if (entry.ssrEntry) {
               const output = await loadEntryOutput(entry)
               if (output instanceof Error) {
                  return this.error(output)
               }
               html = await entry.applyOutput(output, template)
            }
            await fs.mkdir(path.dirname(entry.outputPath), { recursive: true })
            await fs.writeFile(entry.outputPath, html)
            logger.info(`Page ${prettifyPath(entry.templatePath)} saved to ${prettifyPath(entry.outputPath)}`)
         }
      },
      buildEnd() {
         return server.close()
      },
   }
}
