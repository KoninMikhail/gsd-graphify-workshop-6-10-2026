import { initDeck } from "./deck.js";

const sections = [...document.body.children].filter((node) => node.tagName === "SECTION");
await initDeck(sections);

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}
