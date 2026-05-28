// Validate user-entered hex values that must be opaque RGB colors.
export function normalizeUserHex(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed.toLowerCase() : "";
}

// Normalize theme colors that may already include alpha channels.
export function normalizeHex(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(trimmed) ? trimmed.toLowerCase() : "";
}

// Preserve the source alpha channel when reusing translucent theme colors.
export function getAlphaChannel(hexColor: string): string | null {
  const normalized = normalizeHex(hexColor);

  if (!normalized) {
    return null;
  }

  return normalized.length === 9 ? normalized.slice(7) : "ff";
}

// Replace the alpha channel on a normalized color while leaving RGB untouched.
export function withAlpha(hexColor: string, alphaHex: string): string {
  const normalized = normalizeHex(hexColor);

  if (!normalized || !/^[0-9a-fA-F]{2}$/.test(alphaHex)) {
    return normalized;
  }

  return `${normalized.slice(0, 7)}${alphaHex.toLowerCase()}`;
}
