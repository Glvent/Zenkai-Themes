export type ThemePalette = {
  chromeBg: string;
  overlayBg: string;
  commandCenterBg: string;
  sidebarBg: string;
  raisedBg: string;
  editorBg: string;
  activityBarBorder: string;
  border: string;
  indentGuideInactive: string;
  surfaceBg: string;
  chromeBorder: string;
  panelBorder: string;
  interactionBg: string;
  indentGuideActive: string;
  info: string;
  fgSubtle: string;
  fgStatus: string;
  success: string;
  fgMuted: string;
  fgSidebar: string;
  purple: string;
  fgSecondary: string;
  accent: string;
  fg: string;
  error: string;
  warning: string;
  pureRed: string;
  pureWhite: string;
};

export type ThemeVariantSource = {
  id: string;
  name: string;
  outputPath: string;
  palette: ThemePalette;
};
