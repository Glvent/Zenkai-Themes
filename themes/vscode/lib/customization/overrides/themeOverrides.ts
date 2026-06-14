import {
  ACCENT_ALPHA_KEYS,
  ACCENT_COLOR_KEYS,
  POPUP_BACKGROUND_KEYS,
  SIDEBAR_BACKGROUND_KEY,
  TERMINAL_MATCH_KEYS,
} from "../theme/keys";
import { SUPPORTED_THEMES } from "../theme/catalog";
import { getAlphaChannel, normalizeHex, withAlpha } from "../color/hex";
import { alphaFromTransparency } from "../color/math";
import { normalizeSettings } from "../settings";
import type { RawSettings, ThemeColors, ThemeCustomizationBlock, ThemeName } from "../types";

/**
 * Build the managed color overrides for one bundled theme from normalized user preferences.
 * Each section applies one customization dimension: accent and popups.
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

  if (settings.terminalMatchSideBar) {
    const sideBarBackground = overrides[SIDEBAR_BACKGROUND_KEY] ?? colors[SIDEBAR_BACKGROUND_KEY];

    if (sideBarBackground) {
      for (const colorKey of TERMINAL_MATCH_KEYS) {
        overrides[colorKey] = sideBarBackground;
      }
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
