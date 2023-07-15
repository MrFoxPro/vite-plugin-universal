import { r as render, g as getNextElement, s as setAttribute, t as template } from './assets/web.js';

const logo = "/assets/logo.svg";

const app = '';

const _tmpl$ = /*#__PURE__*/template(`<div class="app"><header class="header"><img class="logo" alt="logo"><p>Edit <code>src/App.tsx</code> and save to reload.</p><a class="link" href="https://github.com/solidjs/solid" target="_blank" rel="noopener noreferrer">Learn Solid`);
const App = () => {
  return (() => {
    const _el$ = getNextElement(_tmpl$),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild;
    setAttribute(_el$3, "src", logo);
    return _el$;
  })();
};
render(App, document.body);
