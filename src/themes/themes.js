export const PALETTES = [
  { id: "midnight", label: "Midnight Blue", swatch: "#4f7cff" },
  { id: "ice", label: "Ice Blue", swatch: "#8fd3ff" },
  { id: "lavender", label: "Lavender", swatch: "#a38cff" },
  { id: "rose", label: "Rose Pink", swatch: "#ff7fb2" },
];
export const MODES = ["dark", "light"];
export const STORAGE_KEY = "rd-theme";
export function readTheme() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v && PALETTES.some((p) => p.id === v.palette) && MODES.includes(v.mode)) return v;
  } catch { /* storage unavailable */ }
  return { palette: "midnight", mode: "dark" };
}
export function saveTheme(t) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* ignore */ } }
