import { For, renderToStringAsync } from 'solid-js/web'
const articles = Object.values(import.meta.glob('./articles/*.md', { eager: true }))

export function Blog() {
   return (
      <div class="blog">
         Articles:
         <For each={articles}>
            {(article) => (
               <div class="card">
                  <div>{article.title}</div>
                  <div>{article.description}</div>
               </div>
            )}
         </For>
      </div>
   )
}
export const render = () => renderToStringAsync(Blog)
