import { normalizeUnitInterval, normalizeUserHex } from "./color";
import { THEME_DEFAULT } from "./theme";
import type { BorderStrength, ChromeContrast, NormalizedSettings, RawSettings } from "./types";

/**
 * Coerce user configuration into a stable internal shape so the override builders
 * only deal with validated enums, booleans, and bounded numeric values.
 */
export function normalizeSettings(rawSettings: RawSettings = {}): NormalizedSettings {
  const contrastInput = rawSettings.contrastValue ?? rawSettings.contrast;
  const borderValue = rawSettings.border ?? rawSettings.borderStrength;
  const contrastValue: ChromeContrast =
    contrastInput === "softer" || contrastInput === "stronger" ? contrastInput : THEME_DEFAULT;
  const borderStrength: BorderStrength =
    borderValue === "subtle" || borderValue === "defined" ? borderValue : THEME_DEFAULT;

  return {
    accentCustomColor: normalizeUserHex(rawSettings.accentCustomColor),
    contrastValue,
    borderStrength,
    popupTransparency: normalizeUnitInterval(rawSettings.popupTransparency),
  };
}
