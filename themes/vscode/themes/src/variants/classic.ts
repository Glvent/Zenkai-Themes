import type { ThemeVariantSource } from "../types";

// Classic keeps the warmest Monokai-leaning base in the family, with a gold
// accent, softer olive surfaces, and brighter foreground text for contrast.
export const classicVariant: ThemeVariantSource = {
  id: "classic",
  name: "Zenkai Classic",
  outputPath: "themes/zenkai-classic.json",
  palette: {
    chromeBg: "#1d1d1a",
    overlayBg: "#1f1f1c",
    commandCenterBg: "#23231f",
    sidebarBg: "#272823",
    raisedBg: "#2a2b26",
    editorBg: "#262722",
    activityBarBorder: "#32342e",
    border: "#393b34",
    indentGuideInactive: "#43453e",
    surfaceBg: "#2f312c",
    chromeBorder: "#43463f",
    panelBorder: "#494c44",
    interactionBg: "#585b54",
    indentGuideActive: "#676a62",
    info: "#72c8d3",
    fgSubtle: "#6f7069",
    fgStatus: "#7b7d76",
    success: "#9ec56f",
    fgMuted: "#97988f",
    fgSidebar: "#a5a69b",
    purple: "#a493de",
    fgSecondary: "#c8c7bb",
    accent: "#e6c86a",
    fg: "#f3f1e7",
    error: "#e26f8b",
    warning: "#d59a72",
    pureRed: "#ff0000",
    pureWhite: "#ffffff",
  },
};

export default classicVariant;
