import { c as createSignal, a as createEffect, i as insert, t as template, o as onCleanup, h as hydrate } from './assets/web.js';

const _tmpl$ = /* @__PURE__ */ template(`<h1>Learn Civet `);
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
  return (() => {
    const _el$ = _tmpl$(); _el$.firstChild;
    insert(_el$, counter, null);
    return _el$;
  })();
};

hydrate(App, document.body);
console.log("hydrated");
