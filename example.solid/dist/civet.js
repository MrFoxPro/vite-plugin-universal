import { c as createSignal, a as createEffect, g as getNextElement, b as getNextMarker, i as insert, o as onCleanup, t as template, h as hydrate } from './assets/web.js';

const _tmpl$ = /* @__PURE__ */ template(`<h1>Learn Civet <!#><!/>`);
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
    const _el$ = getNextElement(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, [_el$4, _co$] = getNextMarker(_el$3.nextSibling);
    insert(_el$, counter, _el$4, _co$);
    return _el$;
  })();
};

hydrate(App, document.body);
console.log("hydrated");
