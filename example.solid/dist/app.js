import { r as render, s as ssr, d as ssrAttribute, b as ssrHydrationKey } from './assets/web.js';

const app = '';

const _tmpl$ = ["<div", " class=\"app\"><header class=\"header\"><img", " class=\"logo\" alt=\"logo\"><p>Edit <code>src/App.tsx</code> and save to reload.</p><a class=\"link\" href=\"https://github.com/solidjs/solid\" target=\"_blank\" rel=\"noopener noreferrer\">Learn Solid</a></header></div>"];
const App = () => {
  return ssr(_tmpl$, ssrHydrationKey(), ssrAttribute());
};
render(App, document.body);
