import fs from "node:fs";
import path from "node:path";

import type { ThemePalette, ThemeVariantSource } from "./types";
import classicVariant from "./variants/classic";
import espressoVariant from "./variants/espresso";
import graphiteVariant from "./variants/graphite";
import nautilusVariant from "./variants/nautilus";

// Generate the Chrome theme manifest for every variant from the shared palette
// definitions, mirroring palettes/generate.ts and generate-zed.ts: reverse-map the
// Graphite Chrome manifest's RGB colors to semantic roles, then substitute each
// variant's palette. Chrome colors are [r, g, b] integer arrays.
//
// The Graphite manifest only uses palette roles for its background colors; its
// text/icon colors are plain neutrals that aren't part of the palette, so those pass
// through unchanged and stay shared across variants. The variant identity comes from
// the tinted backgrounds, exactly like the VS Code and Zed themes.

const packageRoot = path.resolve(__dirname, "..");
const chromeRoot = path.resolve(packageRoot, "..", "chrome");

type Rgb = [number, number, number];
type ChromeManifest = {
  manifest_version: number;
  name: string;
  short_name?: string;
  version: string;
  version_name?: string;
  description: string;
  minimum_chrome_version?: string;
  theme: { colors: Record<string, Rgb> };
};

// Roles the Graphite manifest references, keyed by their "r,g,b" value.
const roleByRgb: Record<string, keyof ThemePalette> = Object.freeze({
  "32,32,32": "overlayBg",
  "46,46,46": "activityBarBorder",
  "56,56,56": "indentGuideInactive",
});

// Folder name + description tagline per variant; the name comes from the variant itself.
const taglineById: Record<string, string> = Object.freeze({
  graphite: "A muted graphite dark theme with neutral accents.",
  classic: "A muted dark theme with a warm-olive cast.",
  espresso: "A muted dark theme with a warm-brown cast.",
  nautilus: "A muted dark theme with a cool blue-gray cast.",
});

const variants: ThemeVariantSource[] = [
  classicVariant,
  espressoVariant,
  nautilusVariant,
  graphiteVariant,
];

void main();

function main(): void {
  const baseManifestPath = path.join(chromeRoot, "zenkai-graphite", "manifest.json");
  const baseManifest = JSON.parse(fs.readFileSync(baseManifestPath, "utf8")) as ChromeManifest;

  for (const variant of variants) {
    const manifest = buildManifest(baseManifest, variant);
    const outputDir = path.join(chromeRoot, `zenkai-${variant.id}`);
    const outputPath = path.join(outputDir, "manifest.json");

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, `${serialize(manifest)}\n`, "utf8");
    console.log(`Generated ${path.relative(chromeRoot, outputPath)}`);
  }
}

function buildManifest(baseManifest: ChromeManifest, variant: ThemeVariantSource): ChromeManifest {
  return {
    ...baseManifest,
    name: variant.name,
    description: `${variant.name} - ${taglineById[variant.id] ?? ""}`.trim(),
    theme: { colors: mapColors(baseManifest.theme.colors, variant.palette) },
  };
}

function mapColors(colors: Record<string, Rgb>, palette: ThemePalette): Record<string, Rgb> {
  const result: Record<string, Rgb> = {};

  for (const [key, value] of Object.entries(colors)) {
    const role = roleByRgb[value.join(",")];
    result[key] = role ? hexToRgb(palette[role]) : value;
  }

  return result;
}

// Pretty-print with 2-space indent, but keep each [r, g, b] color array on one line
// to match the conventional Chrome manifest style.
function serialize(manifest: ChromeManifest): string {
  return JSON.stringify(manifest, null, 2).replace(
    /\[\s*\n\s*(\d+),\s*\n\s*(\d+),\s*\n\s*(\d+)\s*\n\s*\]/g,
    "[$1, $2, $3]",
  );
}

function hexToRgb(hex: string): Rgb {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}
