import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.esm.js";
import "reveal.js/dist/reveal.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/700.css";
import "./theme.css";
import { clearOutline, mountOutline } from "./outline.js";
import { clearSteps, mountSteps } from "./steps.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function sectionsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.body.children].filter((node) => node.tagName === "SECTION");
}

function mountChrome() {
  document.querySelector(".brand-chrome")?.remove();
  const chrome = document.createElement("div");
  chrome.className = "brand-chrome";
  chrome.innerHTML = `<img src="/brand/logo.svg" alt="Mikhail Konin" />`;
  document.body.prepend(chrome);
}

export async function initDeck(sections) {
  clearOutline();
  clearSteps();
  const previous = document.querySelector(".reveal");
  const saved = previous?.reveal?.getIndices?.();
  previous?.reveal?.destroy?.();
  previous?.remove();

  const slides = sections.length ? sections : [emptySlide()];
  mountChrome();

  const root = document.createElement("div");
  root.className = "reveal";
  const container = document.createElement("div");
  container.className = "slides";
  container.append(...slides);
  root.append(container);
  document.body.append(root);
  mountScrollableArtifacts(root);

  const deck = new Reveal(root, {
    hash: true,
    respondToHashChanges: true,
    controls: false,
    progress: true,
    slideNumber: false,
    transition: reducedMotion ? "none" : "fade",
    backgroundTransition: "none",
    center: false,
    width: 1600,
    height: 900,
    margin: 0,
    minScale: 0.2,
    maxScale: 2,
    disableLayout: false,
    plugins: [RevealNotes],
  });

  await deck.initialize();
  root.reveal = deck;

  if (saved) deck.slide(saved.h ?? 0, saved.v ?? 0, saved.f ?? -1);
  mountPopovers(root, deck);
  mountOutline(deck);
  mountSteps(deck);
  return deck;
}

function mountScrollableArtifacts(root) {
  root.addEventListener(
    "keydown",
    (event) => {
      const artifact = event.target.closest?.(".artifact--scroll");
      if (!artifact) return;

      const page = Math.max(artifact.clientHeight * 0.8, 120);
      const offsets = {
        ArrowDown: 48,
        ArrowUp: -48,
        PageDown: page,
        PageUp: -page,
      };

      if (event.key in offsets) {
        event.preventDefault();
        event.stopPropagation();
        artifact.scrollBy({ top: offsets[event.key], behavior: "smooth" });
        return;
      }

      if (event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      event.stopPropagation();
      artifact.scrollTo({
        top: event.key === "Home" ? 0 : artifact.scrollHeight,
        behavior: "smooth",
      });
    },
    { capture: true },
  );
}

function mountPopovers(root, deck) {
  let active = null;
  let opener = null;

  const close = () => {
    if (!active) return;
    active.hidden = true;
    opener?.setAttribute("aria-expanded", "false");
    const restoreFocus = opener;
    active = null;
    opener = null;
    restoreFocus?.focus();
  };

  const open = (openButton) => {
    const target = root.querySelector(`#${CSS.escape(openButton.dataset.popoverOpen)}`);
    if (!target) return;
    active = target;
    opener = openButton;
    active.hidden = false;
    opener.setAttribute("aria-expanded", "true");
    active.querySelector("[data-popover-close]")?.focus();
  };

  root.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-popover-open]");
    if (openButton) {
      open(openButton);
      return;
    }

    if (event.target.closest("[data-popover-close]")) close();
  });

  root.addEventListener("keydown", (event) => {
    if (active && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") return;
    const openButton = event.target.closest("[data-popover-open]");
    if (!openButton || active) return;
    event.preventDefault();
    open(openButton);
  });

  deck.on("slidechanged", close);
}

function emptySlide() {
  const section = document.createElement("section");
  section.innerHTML = `<p class="kicker">Deck</p><h2>Нет слайдов</h2><p>Добавьте HTML-файл в папку <code>deck</code>.</p>`;
  return section;
}
