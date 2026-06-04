import type { ThemeVariantSource } from "../types";

// Espresso keeps a faint warm-brown cast on an otherwise neutral gray stack,
// with muted copper accents and softened foreground neutrals.
export const espressoVariant: ThemeVariantSource = {
  id: "espresso",
  name: "Zenkai Espresso",
  outputPath: "themes/zenkai-espresso.json",
  palette: {
    chromeBg: "#1c1b1a",
    overlayBg: "#201f1e",
    commandCenterBg: "#232120",
    sidebarBg: "#242220",
    raisedBg: "#252320",
    editorBg: "#282724",
    activityBarBorder: "#2e2c2a",
    border: "#32302e",
    indentGuideInactive: "#383634",
    surfaceBg: "#393634",
    chromeBorder: "#3a3836",
    panelBorder: "#43403e",
    interactionBg: "#555250",
    indentGuideActive: "#5a5856",
    info: "#72b8d4",
    fgSubtle: "#6c6a68",
    fgStatus: "#6e6c6a",
    success: "#86b074",
    fgMuted: "#8b8886",
    fgSidebar: "#8e8c89",
    purple: "#a894dc",
    fgSecondary: "#bab8b4",
    accent: "#c89878",
    fg: "#eceae6",
    error: "#d07888",
    warning: "#c09868",
    pureRed: "#ff0000",
    pureWhite: "#ffffff",
  },
};

export default espressoVariant;
