import assert from "node:assert/strict";
import test from "node:test";

import { getSupportedThemeNames } from "../lib/customization";
import { normalizeSettings, resolveAccentColor } from "../lib/customization";
import { BORDER_BACKGROUND_KEYS, MANAGED_COLOR_KEYS } from "../lib/customization/theme/keys";
import classicTheme from "../themes/zenkai-classic.json";
import espressoTheme from "../themes/zenkai-espresso.json";
import graphiteTheme from "../themes/zenkai-graphite.json";
import nautilusTheme from "../themes/zenkai-nautilus.json";

const bundledThemes = [
  ["Zenkai Classic", classicTheme],
  ["Zenkai Espresso", espressoTheme],
  ["Zenkai Nautilus", nautilusTheme],
  ["Zenkai Graphite", graphiteTheme],
] as const;

test("supported theme names stay aligned with the packaged variants", () => {
  assert.deepEqual(
    getSupportedThemeNames(),
    bundledThemes.map(([themeName]) => themeName)
  );
});

test("bundled theme metadata names match the packaged variants", () => {
  for (const [themeName, theme] of bundledThemes) {
    assert.equal(theme.name, themeName);
  }
});

test("tokenColors stay shared across every bundled theme", () => {
  const referenceTokenColors = bundledThemes[0][1].tokenColors;

  for (const [themeName, theme] of bundledThemes.slice(1)) {
    assert.deepEqual(theme.tokenColors, referenceTokenColors, `${themeName} tokenColors diverged`);
  }
});

test("bundled themes keep the managed chrome and border keys required by customization", () => {
  const requiredKeys = new Set<string>([
    ...MANAGED_COLOR_KEYS,
    ...Object.values(BORDER_BACKGROUND_KEYS),
    "foreground",
  ]);

  for (const [themeName, theme] of bundledThemes) {
    const colors = theme.colors as Record<string, string>;

    for (const key of requiredKeys) {
      assert.notEqual(colors[key], undefined, `${themeName} is missing ${key}`);
    }
  }
});

test("default accents resolve from each bundled theme's accent keys", () => {
  for (const [themeName, theme] of bundledThemes) {
    const accent = resolveAccentColor(theme.colors, normalizeSettings({}));

    assert.equal(accent, theme.colors["tab.activeForeground"], `${themeName} tab accent mismatch`);
    assert.equal(accent, theme.colors["textLink.foreground"], `${themeName} text link accent mismatch`);
    assert.equal(accent, theme.colors["panelTitle.activeForeground"], `${themeName} panel title accent mismatch`);
    assert.equal(accent, theme.colors["activityBar.activeFocusBorder"], `${themeName} activity bar accent mismatch`);
  }
});
