// Bundled theme labels that the extension actively manages.
export type ThemeName =
  | "Zenkai Classic"
  | "Zenkai Espresso"
  | "Zenkai Nautilus"
  | "Zenkai Graphite";

// Raw settings mirror VS Code configuration values before validation and coercion.
export interface RawSettings {
  accentCustomColor?: unknown;
  popupTransparency?: unknown;
  terminalMatchSideBar?: unknown;
}

// Normalized settings are safe to apply during customization generation.
export interface NormalizedSettings {
  accentCustomColor: string;
  popupTransparency: number;
  terminalMatchSideBar: boolean;
}

export type ThemeColors = Record<string, string>;

// Theme JSON files only need their color map for runtime customization.
export interface ThemeDocument {
  colors: ThemeColors;
  [key: string]: unknown;
}

export interface ThemeDefinition {
  colors: ThemeColors;
}

export type ThemeCustomizationBlock = Record<string, string>;
export type ColorCustomizations = Record<string, unknown>;
