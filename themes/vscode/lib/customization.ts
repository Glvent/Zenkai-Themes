// Public entrypoint for the theme customization helpers used by the extension and tests.
export {
  MANAGED_COLOR_KEYS,
  SETTINGS_NAMESPACE,
  THEME_DEFAULT,
  getSupportedThemeNames,
} from "./customization/theme";
export {
  alphaFromTransparency,
  mixColors,
  scaleLightnessDelta,
  withAlpha,
} from "./customization/color";
export { normalizeSettings } from "./customization/settings";
export {
  buildColorCustomizations,
  buildThemeOverrides,
  resolveAccentColor,
} from "./customization/overrides";
export type {
  BorderStrength,
  ChromeContrast,
  ColorCustomizations,
  NormalizedSettings,
  RawSettings,
  ThemeColors,
  ThemeCustomizationBlock,
  ThemeDefault,
  ThemeDefinition,
  ThemeDocument,
  ThemeName,
} from "./customization/types";
