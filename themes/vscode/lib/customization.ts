// Public entrypoint for the theme customization helpers used by the extension and tests.
export { MANAGED_COLOR_KEYS } from "./customization/theme/keys";
export {
  SETTINGS_NAMESPACE,
  THEME_DEFAULT,
  getSupportedThemeNames,
} from "./customization/theme/catalog";
export { withAlpha } from "./customization/color/hex";
export { alphaFromTransparency } from "./customization/color/math";
export { normalizeSettings } from "./customization/settings";
export { buildColorCustomizations } from "./customization/overrides/customizations";
export {
  buildThemeOverrides,
  resolveAccentColor,
} from "./customization/overrides/themeOverrides";
export type {
  ColorCustomizations,
  NormalizedSettings,
  RawSettings,
  ThemeColors,
  ThemeCustomizationBlock,
  ThemeDefinition,
  ThemeDocument,
  ThemeName,
} from "./customization/types";
