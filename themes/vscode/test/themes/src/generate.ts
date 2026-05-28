import fs from "node:fs";
import path from "node:path";

import graphiteTheme from "../zenkai-graphite.json";
import type { ThemeDocument } from "../../lib/customization/types";
import type { ThemePalette, ThemeVariantSource } from "./types";
import classicVariant from "./variants/classic";
import espressoVariant from "./variants/espresso";
import graphiteVariant from "./variants/graphite";
import nautilusVariant from "./variants/nautilus";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const themeSchema = "vscode://schemas/color-theme";
const baseTheme = graphiteTheme as ThemeDocument & {
  name?: string;
  semanticHighlighting?: boolean;
  tokenColors?: unknown[];
  type?: string;
};

const graphiteRoleByHex: Record<string, keyof ThemePalette> = Object.freeze({
  "#1c1c1c": "chromeBg",
  "#202020": "overlayBg",
  "#232323": "commandCenterBg",
  "#242424": "sidebarBg",
  "#252525": "raisedBg",
  "#282828": "editorBg",
  "#2e2e2e": "activityBarBorder",
  "#323232": "border",
  "#383838": "indentGuideInactive",
  "#39383a": "surfaceBg",
  "#3a3a3a": "chromeBorder",
  "#434344": "panelBorder",
  "#555356": "interactionBg",
  "#5a5a5a": "indentGuideActive",
  "#5ad4e6": "info",
  "#6c6a6f": "fgSubtle",
  "#6e6c71": "fgStatus",
  "#7bd88f": "success",
  "#8b888f": "fgMuted",
  "#8e8b93": "fgSidebar",
  "#948ae3": "purple",
  "#bab6c0": "fgSecondary",
  "#f0a84a": "accent",
  "#f7f1ff": "fg",
  "#fc618d": "error",
  "#fd9353": "warning",
  "#ff0000": "pureRed",
  "#ffffff": "pureWhite",
});

const variants: ThemeVariantSource[] = [
  classicVariant,
  espressoVariant,
  nautilusVariant,
  graphiteVariant,
];

void main();

function main(): void {
  for (const variant of variants) {
    const document = buildThemeDocument(variant);
    const outputPath = path.join(repoRoot, variant.outputPath);

    fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
    console.log(`Generated ${path.relative(repoRoot, outputPath)}`);
  }
}

function buildThemeDocument(variant: ThemeVariantSource): ThemeDocument {
  return {
    $schema: themeSchema,
    type: baseTheme.type ?? "dark",
    colors: buildWorkbenchColors(variant.palette),
    tokenColors: baseTheme.tokenColors ?? [],
    name: variant.name,
    semanticHighlighting: baseTheme.semanticHighlighting ?? true,
  };
}

function buildWorkbenchColors(palette: ThemePalette): Record<string, string> {
  const nextColors: Record<string, string> = {};

  for (const [colorKey, colorValue] of Object.entries(baseTheme.colors)) {
    nextColors[colorKey] = mapColor(colorValue, palette);
  }

  return nextColors;
}

function mapColor(colorValue: string, palette: ThemePalette): string {
  const normalized = colorValue.toLowerCase();

  if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(normalized)) {
    return colorValue;
  }

  const baseHex = normalized.slice(0, 7);
  const alphaSuffix = normalized.length === 9 ? normalized.slice(7) : "";
  const role = graphiteRoleByHex[baseHex];

  if (!role) {
    return colorValue;
  }

  return `${palette[role]}${alphaSuffix}`;
}
