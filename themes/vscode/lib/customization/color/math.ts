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

function toHexByte(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}
