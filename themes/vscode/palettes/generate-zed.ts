import fs from "node:fs";
import path from "node:path";

import type { ThemePalette, ThemeVariantSource } from "./types";
import classicVariant from "./variants/classic";
import espressoVariant from "./variants/espresso";
import graphiteVariant from "./variants/graphite";
import nautilusVariant from "./variants/nautilus";

// Generate the Zed theme JSON for every variant from the shared palette definitions,
// mirroring palettes/generate.ts: reverse-map the Graphite Zed theme's hex values to
// semantic roles, then substitute each variant's palette. Output lives in the Zed
// extension's themes/ directory.

const packageRoot = path.resolve(__dirname, "..");
const zedRoot = path.resolve(packageRoot, "..", "zed");
const baseThemePath = path.join(zedRoot, "themes", "zenkai-graphite.json");

type ThemeStyle = Record<string, unknown>;
type ZedTheme = {
  $schema?: string;
  name: string;
  author: string;
  themes: Array<{ name: string; appearance: string; style: ThemeStyle }>;
};

// Roles that resolve straight to a palette color, plus the chromatic ANSI dim colors,
// which are the matching role darkened to 0.70 brightness per channel.
type DirectRole = { role: keyof ThemePalette };
type DimRole = { role: keyof ThemePalette; darken: number };
type RoleEntry = DirectRole | DimRole;

const DIM_FACTOR = 0.7;

const zedRoleByHex: Record<string, RoleEntry> = Object.freeze({
  "#1c1c1c": { role: "chromeBg" },
  "#202020": { role: "overlayBg" },
  "#232323": { role: "commandCenterBg" },
  "#242424": { role: "sidebarBg" },
  "#252525": { role: "raisedBg" },
  "#282828": { role: "editorBg" },
  "#2e2e2e": { role: "activityBarBorder" },
  "#323232": { role: "border" },
  "#383838": { role: "indentGuideInactive" },
  "#39383a": { role: "surfaceBg" },
  "#3a3a3a": { role: "chromeBorder" },
  "#434344": { role: "panelBorder" },
  "#555356": { role: "interactionBg" },
  "#5a5a5a": { role: "indentGuideActive" },
  "#5ad4e6": { role: "info" },
  "#6c6a6f": { role: "fgSubtle" },
  "#6e6c71": { role: "fgStatus" },
  "#7bd88f": { role: "success" },
  "#8b888f": { role: "fgMuted" },
  "#8e8b93": { role: "fgSidebar" },
  "#948ae3": { role: "purple" },
  "#bab6c0": { role: "fgSecondary" },
  "#f0a84a": { role: "accent" },
  "#f7f1ff": { role: "fg" },
  "#fc618d": { role: "error" },
  "#fd9353": { role: "warning" },
  "#ff0000": { role: "pureRed" },
  "#ffffff": { role: "pureWhite" },
  // Chromatic ANSI dim colors: each is its base role at 0.70 brightness.
  "#b04463": { role: "error", darken: DIM_FACTOR },
  "#569764": { role: "success", darken: DIM_FACTOR },
  "#a87634": { role: "accent", darken: DIM_FACTOR },
  "#b1673a": { role: "warning", darken: DIM_FACTOR },
  "#68619f": { role: "purple", darken: DIM_FACTOR },
  "#3f94a1": { role: "info", darken: DIM_FACTOR },
});

// Off-palette grays the Graphite Zed theme uses. The first three are derived from
// palette roles (formulas chosen to reproduce Graphite exactly); focusBorder has a
// non-uniform delta from interactionBg, so it is given per variant below.
const focusBorderById: Record<string, string> = Object.freeze({
  graphite: "#56545a",
  classic: "#565458",
  espresso: "#565256",
  nautilus: "#555660",
});

const extraRoleByHex: Record<string, "elevatedSurface" | "disabledGray" | "commentGray" | "focusBorder"> =
  Object.freeze({
    "#1e1e1e": "elevatedSurface",
    "#2c2c2c": "disabledGray",
    "#56545a": "focusBorder",
    "#69676c": "commentGray",
  });

const variants: ThemeVariantSource[] = [
  classicVariant,
  espressoVariant,
  nautilusVariant,
  graphiteVariant,
];

void main();

function main(): void {
  const baseTheme = JSON.parse(fs.readFileSync(baseThemePath, "utf8")) as ZedTheme;

  for (const variant of variants) {
    const document = buildThemeDocument(baseTheme, variant);
    const outputPath = path.join(zedRoot, "themes", path.basename(variant.outputPath));

    fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    console.log(`Generated ${path.relative(zedRoot, outputPath)}`);
  }
}

function buildThemeDocument(baseTheme: ZedTheme, variant: ThemeVariantSource): ZedTheme {
  const baseStyle = baseTheme.themes[0]?.style ?? {};

  return {
    $schema: baseTheme.$schema,
    name: variant.name,
    author: baseTheme.author,
    themes: [
      {
        name: variant.name,
        appearance: baseTheme.themes[0]?.appearance ?? "dark",
        style: mapStyle(baseStyle, variant) as ThemeStyle,
      },
    ],
  };
}

function mapStyle(value: unknown, variant: ThemeVariantSource): unknown {
  if (typeof value === "string") {
    return mapColor(value, variant);
  }

  if (Array.isArray(value)) {
    return value.map((item) => mapStyle(item, variant));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = mapStyle(child, variant);
    }
    return result;
  }

  return value;
}

function mapColor(colorValue: string, variant: ThemeVariantSource): string {
  const normalized = colorValue.toLowerCase();

  if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(normalized)) {
    return colorValue;
  }

  const baseHex = normalized.slice(0, 7);
  const alphaSuffix = normalized.length === 9 ? normalized.slice(7) : "";

  const extra = extraRoleByHex[baseHex];
  if (extra) {
    return `${resolveExtra(extra, variant)}${alphaSuffix}`;
  }

  const entry = zedRoleByHex[baseHex];
  if (!entry) {
    return colorValue;
  }

  const resolved = variant.palette[entry.role];
  const finalHex = "darken" in entry ? darkenHex(resolved, entry.darken) : resolved;
  return `${finalHex}${alphaSuffix}`;
}

function resolveExtra(
  extra: "elevatedSurface" | "disabledGray" | "commentGray" | "focusBorder",
  variant: ThemeVariantSource,
): string {
  const { palette } = variant;

  switch (extra) {
    case "elevatedSurface":
      return offsetHex(palette.chromeBg, 2);
    case "disabledGray":
      return offsetHex(palette.editorBg, 4);
    case "commentGray":
      return offsetHex(palette.fgSubtle, -3);
    case "focusBorder":
      return focusBorderById[variant.id] ?? palette.interactionBg;
  }
}

// Shift every channel by a fixed amount, clamped to the byte range.
function offsetHex(hex: string, delta: number): string {
  return transformHex(hex, (channel) => channel + delta);
}

// Scale every channel toward black, rounding per channel.
function darkenHex(hex: string, factor: number): string {
  return transformHex(hex, (channel) => Math.round(channel * factor));
}

function transformHex(hex: string, transform: (channel: number) => number): string {
  const [r, g, b] = hexChannels(hex).map((channel) => clampByte(transform(channel)));
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

function hexChannels(hex: string): [number, number, number] {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, value));
}

function toHexByte(value: number): string {
  return value.toString(16).padStart(2, "0");
}
