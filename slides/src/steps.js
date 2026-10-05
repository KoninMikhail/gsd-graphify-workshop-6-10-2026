export function clearSteps() {
  document.querySelector(".step-nav")?.remove();
}

export function mountSteps(deck) {
  clearSteps();

  const nav = document.createElement("nav");
  nav.className = "step-nav";
  nav.setAttribute("aria-label", "Переход по слайдам");

  const earlier = makeButton("Раньше", () => deck.prev());
  const next = makeButton("Дальше", () => deck.next());

  nav.append(earlier, next);
  document.body.append(nav);

  document.querySelector(".title-start")?.addEventListener("click", () => deck.next());

  const sync = () => {
    const first = deck.isFirstSlide();
    const last = deck.isLastSlide();
    nav.hidden = first;
    earlier.disabled = first;
    next.disabled = last;
  };

  sync();
  deck.on("slidechanged", sync);
}

function makeButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "step-button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}
