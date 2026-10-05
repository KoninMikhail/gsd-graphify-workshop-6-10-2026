import { initDeck, sectionsFromHtml } from "./deck.js";
import { orderedPages } from "./order.js";
import { sources } from "./sources.js";

async function render(map) {
  const sections = orderedPages(map).flatMap(([, html]) => sectionsFromHtml(html));
  await initDeck(sections);
}

await render(sources);

if (import.meta.hot) {
  import.meta.hot.accept("./sources.js", (next) => {
    if (!next?.sources) {
      window.location.reload();
      return;
    }
    render(next.sources);
  });
}
