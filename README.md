This plugin allows to render certain pages statically and serve them on specific paths.

`pnpm i -D vite-solid-ssg-pages`

Imagine you want to deploy blog alongside with app

- Add input to rollup options:

```ts
input: {
    app: './index.html',
    blog: './blog/blog.html',
},
```

- Add plugin:

```ts
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
})
```
- Place <!--ssr-outlet--> in your html.
- Export `render` function that return fragment, e.g. `export const render = () => renderToStringAsync(Blog)`


In dev mode, `localhost:3000/blog` will serve `./blog/blog.html` page.
In production, `./blog/blog.html` will be placed at `dist/blog.html`.

Note: you need to pass reference to solid options! This hack is nescessary.

```tsx
const solidOptions: Partial<SolidOptions> = {
  hot: dev,
  dev: dev,
  extensions: ['.md', '.mdx'],
  ssr: true,
}
plugins: [
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
]
build: {
    rollupOptions: {
        input: {
            app: './index.html',
            blog: './blog/blog.html',
        },
    }
}
```

Checkout [examples](/examples/)
