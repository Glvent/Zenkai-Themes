import type { ThemeVariantSource } from "../types";

// Nautilus keeps a faint cool blue-gray cast on an otherwise neutral gray stack,
// with muted steel-blue accents and calmer foreground neutrals.
export const nautilusVariant: ThemeVariantSource = {
  id: "nautilus",
  name: "Zenkai Nautilus",
  outputPath: "themes/zenkai-nautilus.json",
  palette: {
    chromeBg: "#1b1c20",
    overlayBg: "#1f2024",
    commandCenterBg: "#222328",
    sidebarBg: "#232428",
    raisedBg: "#25262a",
    editorBg: "#282a2e",
    activityBarBorder: "#2d2e34",
    border: "#313238",
    indentGuideInactive: "#37383e",
    surfaceBg: "#383a40",
    chromeBorder: "#393a40",
    panelBorder: "#424448",
    interactionBg: "#54555c",
    indentGuideActive: "#595a62",
    info: "#5888b0",
    fgSubtle: "#6a6c74",
    fgStatus: "#6c6e76",
    success: "#78b888",
    fgMuted: "#8a8c94",
    fgSidebar: "#8c8e96",
    accent: "#5278a0",
    purple: "#9890d8",
    fgSecondary: "#b8b6c0",
    fg: "#d6dae4",
    error: "#d07888",
    warning: "#d0a870",
    pureRed: "#ff0000",
    pureWhite: "#ffffff",
  },
};

export default nautilusVariant;
