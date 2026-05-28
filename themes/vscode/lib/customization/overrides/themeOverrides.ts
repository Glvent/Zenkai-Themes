import {
  ACCENT_ALPHA_KEYS,
  ACCENT_COLOR_KEYS,
  BORDER_BACKGROUND_KEYS,
  CHROME_COLOR_KEYS,
  POPUP_BACKGROUND_KEYS,
  SUPPORTED_THEMES,
  THEME_DEFAULT,
} from "../theme";
import {
  alphaFromTransparency,
  getAlphaChannel,
  mixColors,
  normalizeHex,
  scaleLightnessDelta,
  withAlpha,
} from "../color";
import { normalizeSettings } from "../settings";
import type { RawSettings, ThemeColors, ThemeCustomizationBlock, ThemeName } from "../types";

/**
 * Build the managed color overrides for one bundled theme from normalized user preferences.
 * Each section applies one customization dimension: accent, contrast, borders, popups, and guides.
 */
export function buildThemeOverrides(
  themeName: ThemeName,
  rawSettings: RawSettings
): ThemeCustomizationBlock {
  const theme = SUPPORTED_THEMES[themeName];

  if (!theme) {
    return {};
  }

  const settings = normalizeSettings(rawSettings);
  const colors = theme.colors;
  const overrides: ThemeCustomizationBlock = {};
  const accentIsCustomized = Boolean(settings.accentCustomColor);
  const resolvedAccentColor = resolveAccentColor(colors, settings);
  const accentColor = accentIsCustomized ? resolvedAccentColor : "";

  if (accentIsCustomized && accentColor) {
    for (const colorKey of ACCENT_COLOR_KEYS) {
      if (colors[colorKey]) {
        overrides[colorKey] = accentColor;
      }
    }

    for (const colorKey of ACCENT_ALPHA_KEYS) {
      const baseColor = colors[colorKey];

      if (!baseColor) {
        continue;
      }

      const alpha = getAlphaChannel(baseColor);
      if (alpha === null || alpha === "ff") {
        continue;
      }

      overrides[colorKey] = withAlpha(accentColor, alpha);
    }
  }

  if (settings.contrastValue !== THEME_DEFAULT) {
    const factor = settings.contrastValue === "softer" ? 0.65 : 1.35;
    const editorBackground = colors["editor.background"];

    if (editorBackground) {
      for (const colorKey of CHROME_COLOR_KEYS) {
        const baseColor = colors[colorKey];

        if (!baseColor) {
          continue;
        }

        overrides[colorKey] = scaleLightnessDelta(baseColor, editorBackground, factor);
      }
    }
  }

  if (settings.borderStrength !== THEME_DEFAULT) {
    for (const [colorKey, backgroundKey] of Object.entries(BORDER_BACKGROUND_KEYS)) {
      const baseColor = colors[colorKey];
      const backgroundColor = colors[backgroundKey];
      const foregroundColor = colors.foreground;

      if (!baseColor || !backgroundColor || !foregroundColor) {
        continue;
      }

      overrides[colorKey] =
        settings.borderStrength === "subtle"
          ? mixColors(baseColor, backgroundColor, 0.7)
          : mixColors(baseColor, foregroundColor, 0.3);
    }
  }

  if (settings.popupTransparency > 0) {
    const alpha = alphaFromTransparency(settings.popupTransparency);

    for (const colorKey of POPUP_BACKGROUND_KEYS) {
      const baseColor = overrides[colorKey] ?? colors[colorKey];

      if (!baseColor) {
        continue;
      }

      overrides[colorKey] = withAlpha(baseColor, alpha);
    }
  }

  return overrides;
}

// Resolve the accent from user config first, then fall back to the theme's existing accent-like keys.
export function resolveAccentColor(themeColors: ThemeColors, settings: RawSettings): string {
  if (settings.accentCustomColor) {
    return settings.accentCustomColor as string;
  }

  return normalizeHex(
    themeColors["tab.activeForeground"] ||
    themeColors["textLink.foreground"] ||
    themeColors["panelTitle.activeForeground"] ||
    themeColors["activityBar.activeFocusBorder"]
  );
}
