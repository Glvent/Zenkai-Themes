import { MANAGED_COLOR_KEYS } from "../theme/keys";
import { SUPPORTED_THEMES, getSupportedThemeNames } from "../theme/catalog";
import { normalizeSettings } from "../settings";
import type { ColorCustomizations, RawSettings, ThemeName } from "../types";
import { buildThemeOverrides } from "./themeOverrides";

/**
 * Merge Zenkai-managed overrides into the user's existing color customizations
 * without disturbing unrelated keys or unsupported themes.
 */
export function buildColorCustomizations(
  existingCustomizations: ColorCustomizations | unknown,
  activeThemeName: ThemeName | string,
  rawSettings: RawSettings
): ColorCustomizations {
  if (!(activeThemeName in SUPPORTED_THEMES)) {
    return isPlainObject(existingCustomizations) ? existingCustomizations : {};
  }

  const settings = normalizeSettings(rawSettings);
  const nextCustomizations = isPlainObject(existingCustomizations)
    ? { ...existingCustomizations }
    : {};

  for (const themeName of getSupportedThemeNames()) {
    const themeKey = `[${themeName}]`;
    const themeBlock = isPlainObject(nextCustomizations[themeKey])
      ? { ...(nextCustomizations[themeKey] as Record<string, unknown>) }
      : {};

    for (const colorKey of MANAGED_COLOR_KEYS) {
      delete themeBlock[colorKey];
    }

    const overrides = buildThemeOverrides(themeName, settings);
    Object.assign(themeBlock, overrides);

    if (Object.keys(themeBlock).length === 0) {
      delete nextCustomizations[themeKey];
      continue;
    }

    nextCustomizations[themeKey] = themeBlock;
  }

  return nextCustomizations;
}

// Theme blocks inside colorCustomizations must stay plain objects so they can be copied and pruned safely.
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
