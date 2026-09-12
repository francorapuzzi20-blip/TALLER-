export const COLORS = {
  bg: "#12161A",
  panel: "#1B2126",
  panelAlt: "#202830",
  border: "#2C363D",
  text: "#E9EDEF",
  textMuted: "#8B98A1",
  accent: "#F5871F",
  accentDim: "#3A2A18",
  steel: "#6C93AA",
  income: "#5FA777",
  incomeDim: "#1E2A22",
  expense: "#C4574A",
  expenseDim: "#2C1E1C",
};

export const HEAD = { fontFamily: "'Space Grotesk', sans-serif" };
export const MONO = { fontFamily: "'IBM Plex Mono', monospace" };

export const fmt = (n) => "$" + Number(n || 0).toLocaleString("es-AR");
