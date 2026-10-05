let abort = null;

export function clearOutline() {
  abort?.abort();
  abort = null;
  document.querySelector(".outline-toggle")?.remove();
  document.querySelector(".outline-root")?.remove();
}

export function mountOutline(deck) {
  clearOutline();
  abort = new AbortController();
  const { signal } = abort;

  const rows = collectRows(deck.getRevealElement());
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "outline-toggle";
  toggle.textContent = "Оглавление";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "outline-drawer");

  const shell = document.createElement("div");
  shell.className = "outline-root";
  shell.inert = true;

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "outline-backdrop";
  backdrop.setAttribute("aria-label", "Закрыть оглавление");
  backdrop.tabIndex = -1;

  const drawer = document.createElement("aside");
  drawer.id = "outline-drawer";
  drawer.className = "outline-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-hidden", "true");
  drawer.setAttribute("aria-labelledby", "outline-title");

  const head = document.createElement("div");
  head.className = "outline-head";
  const title = document.createElement("p");
  title.id = "outline-title";
  title.className = "kicker";
  title.textContent = "Оглавление";
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "outline-close";
  closeButton.textContent = "Закрыть";
  head.append(title, closeButton);

  const list = document.createElement("ol");
  list.className = "outline-list";
  for (const row of rows) {
    const item = document.createElement("li");
    item.className = row.depth ? "is-nested" : "";
    item.dataset.h = String(row.h);
    item.dataset.v = String(row.v);
    const button = document.createElement("button");
    button.type = "button";
    const index = document.createElement("span");
    index.className = "outline-index";
    index.textContent = row.marker;
    const label = document.createElement("span");
    label.textContent = row.title;
    button.append(index, label);
    button.addEventListener("click", () => {
      deck.slide(row.h, row.v);
      close(true);
    });
    item.append(button);
    list.append(item);
  }

  drawer.append(head, list);
  shell.append(backdrop, drawer);
  document.body.append(toggle, shell);

  let open = false;

  function markCurrent() {
    const { h, v } = deck.getIndices();
    for (const item of list.children) {
      const current = Number(item.dataset.h) === h && Number(item.dataset.v) === v;
      item.classList.toggle("is-current", current);
      const button = item.querySelector("button");
      if (current) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
  }

  function setOpen(next) {
    open = next;
    shell.classList.toggle("is-open", next);
    shell.inert = !next;
    toggle.setAttribute("aria-expanded", String(next));
    drawer.setAttribute("aria-hidden", String(!next));
    if (!next) return;
    if (deck.isOverview()) deck.toggleOverview(false);
    markCurrent();
    const current = list.querySelector(".is-current button") ?? list.querySelector("button");
    current?.focus();
  }

  function close(restoreFocus) {
    setOpen(false);
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => setOpen(!open));
  closeButton.addEventListener("click", () => close(true));
  backdrop.addEventListener("click", () => close(true));
  deck.on("slidechanged", markCurrent);

  document.addEventListener(
    "keydown",
    (event) => {
      if (!open || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    },
    { capture: true, signal },
  );
}

function collectRows(root) {
  return [...root.querySelectorAll(".slides > section")].flatMap((section, h) => {
    const verticals = [...section.children].filter((node) => node.tagName === "SECTION");
    if (!verticals.length) {
      return [{ h, v: 0, depth: 0, marker: pad(h + 1), title: titleOf(section, h) }];
    }
    return verticals.map((child, v) => ({
      h,
      v,
      depth: v === 0 ? 0 : 1,
      marker: v === 0 ? pad(h + 1) : `${pad(h + 1)}.${v}`,
      title: titleOf(child, h) || titleOf(section, h),
    }));
  });
}

function titleOf(section, h) {
  const heading = [...section.querySelectorAll("h1, h2, h3")].find(
    (node) => node.closest("section") === section,
  );
  if (!heading) return `Слайд ${pad(h + 1)}`;
  const text = [...heading.childNodes]
    .map((node) => (node.nodeName === "BR" ? " " : node.textContent))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return text || `Слайд ${pad(h + 1)}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}
