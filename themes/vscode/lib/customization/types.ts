// Bundled theme labels that the extension actively manages.
export type ThemeName =
  | "Zenkai Classic"
  | "Zenkai Espresso"
  | "Zenkai Nautilus"
  | "Zenkai Graphite";

export type ThemeDefault = "default";
export type ChromeContrast = ThemeDefault | "softer" | "stronger";
export type BorderStrength = ThemeDefault | "subtle" | "defined";

// Raw settings mirror VS Code configuration values before validation and coercion.
export interface RawSettings {
  accentCustomColor?: unknown;
  contrast?: unknown;
  contrastValue?: unknown;
  border?: unknown;
  borderStrength?: unknown;
  popupTransparency?: unknown;
}

// Normalized settings are safe to apply during customization generation.
export interface NormalizedSettings {
  accentCustomColor: string;
  contrastValue: ChromeContrast;
  borderStrength: BorderStrength;
  popupTransparency: number;
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

// Parsed RGBA channels used by the color math helpers.
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
