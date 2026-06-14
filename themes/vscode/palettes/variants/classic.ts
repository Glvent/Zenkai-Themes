import type { ThemeVariantSource } from "../types";

// Classic keeps a faint warm-olive cast on an otherwise neutral gray stack,
// with a muted gold accent and calmer foreground neutrals.
export const classicVariant: ThemeVariantSource = {
  id: "classic",
  name: "Zenkai Classic",
  outputPath: "themes/zenkai-classic.json",
  palette: {
    chromeBg: "#1c1c1a",
    overlayBg: "#201f1e",
    commandCenterBg: "#232220",
    sidebarBg: "#242422",
    raisedBg: "#252523",
    editorBg: "#282826",
    activityBarBorder: "#2e2e2c",
    border: "#323230",
    indentGuideInactive: "#383836",
    surfaceBg: "#393834",
    chromeBorder: "#3a3a38",
    panelBorder: "#434341",
    interactionBg: "#555452",
    indentGuideActive: "#5a5a58",
    info: "#6ec4d0",
    fgSubtle: "#6c6c68",
    fgStatus: "#6e6e6a",
    success: "#8ec078",
    fgMuted: "#8b8b87",
    fgSidebar: "#8e8e8a",
    purple: "#9a90dc",
    fgSecondary: "#babab4",
    accent: "#ddb860",
    fg: "#f0f0ea",
    error: "#dc7890",
    warning: "#d09570",
    pureRed: "#ff0000",
    pureWhite: "#ffffff",
  },
};

export default classicVariant;
