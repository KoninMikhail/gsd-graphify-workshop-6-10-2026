export function orderedPages(map) {
  return Object.entries(map)
    .filter(([file]) => {
      const name = file.split(/[/\\]/).pop() ?? "";
      return name.endsWith(".html") && !name.startsWith("_");
    })
    .sort(([a], [b]) => a.localeCompare(b, "en"));
}
