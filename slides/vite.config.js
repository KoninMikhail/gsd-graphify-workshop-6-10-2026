import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const deckDir = resolve(root, "deck");
const deckPages = readdirSync(deckDir)
  .filter((name) => name.endsWith(".html") && !name.startsWith("_"))
  .map((name) => [name.replace(/\.html$/, ""), resolve(deckDir, name)]);

export default defineConfig({
  root,
  appType: "mpa",
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        ...Object.fromEntries(deckPages),
      },
    },
  },
});
