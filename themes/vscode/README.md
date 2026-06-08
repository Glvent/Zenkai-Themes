# Zenkai (VS Code)

Zenkai is a Monokai-derived VS Code theme extension with four UI variants. Syntax colors follow Monokai Pro; the workbench is a custom, flatter, lower-contrast shell with light borders and optional runtime customization.

Shared palette data for all editors lives in [`../reference/`](../reference/) (`zenkai-palettes.json`).

## Themes

| Variant | Character |
| --- | --- |
| **Classic** | Warm olive cast on neutral grays; muted gold accent |
| **Espresso** | Warm brown cast; muted copper accent |
| **Nautilus** | Cool blue-gray cast; steel-blue accent |
| **Graphite** | Neutral charcoal; Monokai Pro accents (generation baseline) |

Variant differences are UI-surface remaps only—borders, transparency, shadows, and interaction styling stay structurally consistent. Syntax `tokenColors` are shared across variants.

## Customization

When a bundled Zenkai theme is active, the extension applies theme-scoped `workbench.colorCustomizations` and leaves unrelated theme overrides intact.

| Setting | Values | Effect |
| --- | --- | --- |
| `zenkai.accentCustomColor` | `#RRGGBB` or empty | Custom accent; blank keeps the theme accent |
| `zenkai.contrast` | `default`, `softer`, `stronger` | Surface contrast vs bundled values |
| `zenkai.border` | `default`, `subtle`, `defined` | Border/divider prominence |
| `zenkai.popupTransparency` | `0`–`1` | Popup menu opacity (`1` = opaque) |

## Source layout

```
themes/src/
  types.ts          # ThemePalette roles
  generate.ts       # Remap Graphite workbench colors → variant palettes
  variants/         # classic, espresso, nautilus, graphite (.ts)
themes/
  zenkai-*.json     # Generated VS Code color themes (do not hand-edit)
```

Edit palettes in `themes/src/variants/`, then regenerate. Do not edit `themes/*.json` directly.

## Development

From `themes/vscode`:

| Script | What it does |
| --- | --- |
| `npm run generate:themes` | Compile theme sources and write `themes/zenkai-*.json` |
| `npm run compile` | `clean` → `generate:themes` → compile extension to `dist/` |
| `npm test` | `compile` then Node tests (`customization`, theme generation) |
| `npm run test:compiled` | Tests only (requires `dist/`) |
| `npm run build` | `compile` → package VSIX, run tests, refresh local install |
| `npm run package` | Same as `build` |
| `npm run dev` | `compile`, launch Extension Development Host, `watch` |
| `npm run watch` | TypeScript watch for extension code |
| `npm run clean` | Remove `dist/` |

Typical loop after palette changes:

```bash
npm run generate:themes
npm test
```

## Packaging a VSIX

`npm run build` (or `package`) compiles the extension, runs tests, and invokes `@vscode/vsce package`. The `.vsix` is written to this directory (`zenkai-*.vsix`). The build script also uninstalls/reinstalls into the detected VS Code / Cursor CLI when available.

To package without reinstalling, run compile and vsce manually:

```bash
npm run compile
npx --yes @vscode/vsce package --allow-missing-repository --skip-license
```

## Notes

- Monokai Pro informed syntax colors; the workbench UI is an original softer layout.
- `theme-references/` under this package is gitignored local scratch; use tracked [`../reference/`](../reference/) for cross-editor palettes.
