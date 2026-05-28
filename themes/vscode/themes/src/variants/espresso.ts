import type { ThemeVariantSource } from "../types";

// Espresso keeps the warmest surface stack in the family, with copper accents
// and slightly softened neutrals to separate it from Graphite and Classic.
export const espressoVariant: ThemeVariantSource = {
  id: "espresso",
  name: "Zenkai Espresso",
  outputPath: "themes/zenkai-espresso.json",
  palette: {
    chromeBg: "#181513",
    overlayBg: "#1a1715",
    commandCenterBg: "#211d1a",
    sidebarBg: "#25211e",
    raisedBg: "#272320",
    editorBg: "#211d1a",
    activityBarBorder: "#2f2a26",
    border: "#36312d",
    indentGuideInactive: "#403934",
    surfaceBg: "#2b2623",
    chromeBorder: "#433b36",
    panelBorder: "#4d4540",
    interactionBg: "#5a524c",
    indentGuideActive: "#69615b",
    info: "#75bddb",
    fgSubtle: "#796d65",
    fgStatus: "#877a73",
    success: "#8fb772",
    fgMuted: "#9b8f87",
    fgSidebar: "#aea39a",
    purple: "#ae97de",
    fgSecondary: "#d2c5ba",
    accent: "#d89d74",
    fg: "#ece4dc",
    error: "#d97b8d",
    warning: "#c8a06d",
    pureRed: "#ff0000",
    pureWhite: "#ffffff",
  },
};

export default espressoVariant;
