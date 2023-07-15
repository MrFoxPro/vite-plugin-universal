import logo from './logo.svg'
import './app.css'
import { render } from 'solid-js/web'

const App = () => {
   return (
      <div class="app">
         <header class="header">
            <img src={logo} class="logo" alt="logo" />
            <p>
               Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a class="link" href="https://github.com/solidjs/solid" target="_blank" rel="noopener noreferrer">
               Learn Solid
            </a>
         </header>
      </div>
   )
}
render(App, document.body)
