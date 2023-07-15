import { For, renderToString } from 'solid-js/web'
const articles = Object.values(import.meta.glob('./articles/*.md', { eager: true }))
export function Blog() {
   return (
      <>
         <b>Articles:</b>
         <ul class="blog">
            <For each={articles}>
               {({ frontmatter: { title, description } }) => (
                  <li class="card">
                     <div>{title}</div>
                     <div>{description}</div>
                  </li>
               )}
            </For>
         </ul>
      </>
   )
}

export default {
   output() {
      return { head: [], body: [renderToString(Blog)] }
   },
}
