import { normalizeUserHex } from "./color/hex";
import { normalizeUnitInterval } from "./color/math";
import type { NormalizedSettings, RawSettings } from "./types";

/**
 * Coerce user configuration into a stable internal shape so the override builders
 * only deal with validated values.
 */
export function normalizeSettings(rawSettings: RawSettings = {}): NormalizedSettings {
  return {
    accentCustomColor: normalizeUserHex(rawSettings.accentCustomColor),
    popupTransparency: normalizeUnitInterval(rawSettings.popupTransparency),
    terminalMatchSideBar: rawSettings.terminalMatchSideBar === true,
  };
}
