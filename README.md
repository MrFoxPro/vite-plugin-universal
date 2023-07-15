This plugin allows to configure rendering of certain pages in SSG, in SSG + JS mode and serve them on specific paths.
If you're familiar with vite-plugin-ssr, it's simple replacement for it.


`pnpm i -D vite-plugin-universal`

Example configuration:
```ts
ViteUniversalPagesPlugin<{ head: string[]; body: string[] }>({
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
```
Will produce following build output:
```
dist
 ┣ assets
 ┃ ┣ app.css
 ┃ ┣ logo.svg
 ┃ ┗ web.js
 ┣ nested
 ┃ ┗ civet.html
 ┣ app.js
 ┣ blog.html
 ┣ civet.js
 ┗ index.html
```
Check out example to see how it works.

Also, make sure to specify absolute paths to assets and modules in your html templates and ensure you have `base: '/'` in your Vite configuration.
