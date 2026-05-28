import type { ParsedColor } from "../types";
import { normalizeHex } from "./hex";

// Shared numeric guard used throughout normalization and color math.
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Popup transparency is user-facing decimal input on a 0..1 scale.
export function normalizeUnitInterval(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return clamp(value, 0, 1);
}

// VS Code alpha uses the same 0..1 scale but expects an 8-bit channel value.
export function alphaFromTransparency(transparency: number): string {
  return toHexByte(255 * clamp(transparency, 0, 1));
}

/**
 * Move a color toward or away from a reference lightness while preserving hue/saturation.
 * This keeps chrome contrast changes anchored to the theme's editor background.
 */
export function scaleLightnessDelta(baseHex: string, referenceHex: string, factor: number): string {
  const base = parseHexColor(baseHex);
  const reference = parseHexColor(referenceHex);

  if (!base || !reference) {
    return normalizeHex(baseHex);
  }

  const baseHsl = rgbToHsl(base);
  const referenceHsl = rgbToHsl(reference);
  const nextLightness = clamp(
    referenceHsl.l + (baseHsl.l - referenceHsl.l) * factor,
    0,
    1
  );

  return formatHex({
    ...hslToRgb({
      h: baseHsl.h,
      s: baseHsl.s,
      l: nextLightness,
    }),
    a: base.a,
  });
}

// Linear RGBA mix used for border blending.
export function mixColors(fromHex: string, toHex: string, weight: number): string {
  const from = parseHexColor(fromHex);
  const to = parseHexColor(toHex);

  if (!from || !to) {
    return normalizeHex(fromHex);
  }

  return formatHex({
    r: mixChannel(from.r, to.r, weight),
    g: mixChannel(from.g, to.g, weight),
    b: mixChannel(from.b, to.b, weight),
    a: mixChannel(from.a, to.a, weight),
  });
}

function mixChannel(from: number, to: number, weight: number): number {
  return Math.round(from + (to - from) * weight);
}

function parseHexColor(hexColor: string): ParsedColor | null {
  const normalized = normalizeHex(hexColor);

  if (!normalized) {
    return null;
  }

  const hasAlpha = normalized.length === 9;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
    a: hasAlpha ? parseInt(normalized.slice(7, 9), 16) : 255,
  };
}

function formatHex(color: ParsedColor): string {
  const hex = `#${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
  return color.a < 255 ? `${hex}${toHexByte(color.a)}` : hex;
}

function toHexByte(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHsl(color: ParsedColor): { h: number; s: number; l: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
        break;
    }

    h /= 6;

    if (h < 0) {
      h += 1;
    }
  }

  return { h, s, l };
}

function hslToRgb(color: { h: number; s: number; l: number }): Omit<ParsedColor, "a"> {
  const { h, s, l } = color;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let value = t;

  if (value < 0) {
    value += 1;
  }
  if (value > 1) {
    value -= 1;
  }
  if (value < 1 / 6) {
    return p + (q - p) * 6 * value;
  }
  if (value < 1 / 2) {
    return q;
  }
  if (value < 2 / 3) {
    return p + (q - p) * (2 / 3 - value) * 6;
  }
  return p;
}
