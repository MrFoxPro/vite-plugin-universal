This plugin allows to configure rendering of certain pages in SSG, in SSG + JS mode and serve them on specific paths.

`pnpm i -D vite-plugin-universal`

- Add plugin:

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

