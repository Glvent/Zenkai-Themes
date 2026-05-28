import assert from "node:assert/strict";
import test from "node:test";

import {
  alphaFromTransparency,
  buildColorCustomizations,
  buildThemeOverrides,
  mixColors,
  normalizeSettings,
  resolveAccentColor,
  scaleLightnessDelta,
  withAlpha,
} from "../lib/customization";
import classicTheme from "../themes/zenkai-classic.json";
import espressoTheme from "../themes/zenkai-espresso.json";
import graphiteTheme from "../themes/zenkai-graphite.json";
import nautilusTheme from "../themes/zenkai-nautilus.json";

test("theme defaults resolve per bundled theme", () => {
  const classicAccent = resolveAccentColor(classicTheme.colors, normalizeSettings({}));
  const espressoAccent = resolveAccentColor(espressoTheme.colors, normalizeSettings({}));
  const nautilusAccent = resolveAccentColor(nautilusTheme.colors, normalizeSettings({}));
  const graphiteAccent = resolveAccentColor(graphiteTheme.colors, normalizeSettings({}));

  assert.equal(classicAccent, "#e6c86a");
  assert.equal(espressoAccent, "#d89d74");
  assert.equal(nautilusAccent, "#68b8ac");
  assert.equal(graphiteAccent, "#f0a84a");
});

test("custom hex is normalized and invalid custom hex falls back to the bundled accent", () => {
  const graphiteColors = graphiteTheme.colors;

  assert.equal(
    resolveAccentColor(
      graphiteColors,
      normalizeSettings({
        accentCustomColor: "#123ABC",
      })
    ),
    "#123abc"
  );

  assert.equal(
    resolveAccentColor(
      graphiteColors,
      normalizeSettings({
        accentCustomColor: "not-a-color",
      })
    ),
    "#f0a84a"
  );
});

test("accent overrides recolor both solid and translucent managed keys", () => {
  const overrides = buildThemeOverrides("Zenkai Graphite", {
    accentCustomColor: "#78dce8",
  });

  assert.equal(overrides["activityBar.foreground"], "#78dce8");
  assert.equal(overrides["activityBarTop.foreground"], "#78dce8");
  assert.equal(overrides["tab.activeForeground"], "#78dce8");
  assert.equal(overrides["panelTitle.activeBorder"], "#78dce8");
  assert.equal(overrides["editor.findMatchBackground"], "#78dce826");
  assert.equal(overrides["list.activeSelectionBackground"], "#78dce80c");
});

test("chrome contrast keeps editor background anchored while shifting surface separation", () => {
  const softer = buildThemeOverrides("Zenkai Graphite", {
    contrastValue: "softer",
  });
  const stronger = buildThemeOverrides("Zenkai Graphite", {
    contrastValue: "stronger",
  });

  assert.equal(softer["editor.background"], "#282828");
  assert.equal(stronger["editor.background"], "#282828");
  assert.notEqual(softer["panel.background"], "#39383a");
  assert.notEqual(stronger["panel.background"], "#39383a");
  assert.notEqual(softer["panel.background"], stronger["panel.background"]);
  assert.notEqual(softer["menu.background"], "#202020");
  assert.notEqual(stronger["menu.background"], "#202020");
  assert.notEqual(softer["menu.background"], softer["sideBar.background"]);
  assert.notEqual(stronger["menu.background"], stronger["sideBar.background"]);
  assert.notEqual(softer["menu.background"], stronger["menu.background"]);
  assert.equal(softer["terminal.background"], softer["panel.background"]);
  assert.equal(stronger["terminal.background"], stronger["panel.background"]);
});

test("border strength mixes borders toward the intended target", () => {
  const subtle = buildThemeOverrides("Zenkai Graphite", {
    borderStrength: "subtle",
  });
  const defined = buildThemeOverrides("Zenkai Graphite", {
    borderStrength: "defined",
  });

  assert.equal(subtle["activityBar.border"], mixColors("#2e2e2e", "#202020", 0.7));
  assert.equal(defined["activityBar.border"], mixColors("#2e2e2e", "#f7f1ff", 0.3));
});

test("popup transparency applies alpha to popup menu backgrounds", () => {
  const overrides = buildThemeOverrides("Zenkai Graphite", {
    popupTransparency: 0.4,
  });

  assert.equal(overrides["menu.background"], "#20202066");
  assert.equal(overrides["dropdown.background"], "#20202066");
  assert.equal(overrides["dropdown.listBackground"], "#20202066");
  assert.equal(overrides["editorSuggestWidget.background"], "#20202066");
  assert.equal(overrides["quickInput.background"], "#20202066");
});

test("popup transparency composes with chrome contrast", () => {
  const overrides = buildThemeOverrides("Zenkai Graphite", {
    contrastValue: "stronger",
    popupTransparency: 0.5,
  });

  assert.notEqual(overrides["editorSuggestWidget.background"], "#20202080");
  assert.match(overrides["editorSuggestWidget.background"], /^#[0-9a-f]{6}80$/);
});

test("buildColorCustomizations preserves unrelated keys and removes managed keys on reset", () => {
  const existing = {
    "editorCursor.foreground": "#ffffff",
    "[Zenkai Classic]": {
      "sideBar.foreground": "#abcdef",
      "tab.activeForeground": "#654321",
    },
  };

  const applied = buildColorCustomizations(existing, "Zenkai Classic", {
    accentCustomColor: "#ff6188",
  });

  assert.equal(applied["editorCursor.foreground"], "#ffffff");
  assert.equal((applied["[Zenkai Classic]"] as Record<string, string>)["sideBar.foreground"], "#abcdef");
  assert.equal((applied["[Zenkai Classic]"] as Record<string, string>)["tab.activeForeground"], "#ff6188");
  assert.equal((applied["[Zenkai Graphite]"] as Record<string, string>)["tab.activeForeground"], "#ff6188");

  const reset = buildColorCustomizations(applied, "Zenkai Classic", {});
  assert.equal(reset["editorCursor.foreground"], "#ffffff");
  assert.equal((reset["[Zenkai Classic]"] as Record<string, string>)["sideBar.foreground"], "#abcdef");
  assert.equal((reset["[Zenkai Classic]"] as Record<string, string>)["tab.activeForeground"], undefined);
});

test("unsupported active themes are left untouched", () => {
  const existing = {
    "[Zenkai Graphite]": {
      "tab.activeForeground": "#f0a84a",
    },
  };

  assert.equal(
    buildColorCustomizations(existing, "One Dark Pro", {
      accentCustomColor: "#78dce8",
    }),
    existing
  );
});

test("utility helpers preserve alpha channels", () => {
  assert.equal(alphaFromTransparency(0), "00");
  assert.equal(alphaFromTransparency(0.4), "66");
  assert.equal(alphaFromTransparency(1), "ff");
  assert.equal(withAlpha("#78dce8", "26"), "#78dce826");
  assert.equal(scaleLightnessDelta("#39383a", "#282828", 1), "#39383a");
});

test("popup transparency normalization preserves decimals and clamps to the supported range", () => {
  assert.equal(normalizeSettings({ popupTransparency: 0.35 }).popupTransparency, 0.35);
  assert.equal(normalizeSettings({ popupTransparency: -1 }).popupTransparency, 0);
  assert.equal(normalizeSettings({ popupTransparency: 2 }).popupTransparency, 1);
});
