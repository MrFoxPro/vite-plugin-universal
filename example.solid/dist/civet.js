import { c as createSignal, a as createEffect, s as ssr, e as escape, b as ssrHydrationKey, o as onCleanup, h as hydrate } from './assets/web.js';

const _tmpl$ = ["<h1", ">Learn Civet <!--#-->", "<!--/--></h1>"];
const App = function() {
  const [counter, setCounter] = createSignal(0);
  createEffect(function() {
    const interval = setInterval(function() {
      return setCounter((counter2) => counter2 + 1);
    }, 1e3);
    return onCleanup(function() {
      return clearInterval(interval);
    });
  });
  return ssr(_tmpl$, ssrHydrationKey(), escape(counter()));
};

hydrate(App, document.body);
console.log("hydrated");
