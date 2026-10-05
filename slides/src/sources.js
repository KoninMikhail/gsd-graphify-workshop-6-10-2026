export const sources = import.meta.glob("../deck/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});
