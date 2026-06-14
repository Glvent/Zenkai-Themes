# Zenkai palette reference

Portable, editor-agnostic color data for all Zenkai UI variants. Use this when building or syncing themes for VS Code, Zed, Chrome, or other targets without copying hex values by hand from each editor’s theme file.

---

## References

[palettes.json](palettes.json) includes all four variants: 
- `classic`, 
- `espresso`, 
- `nautilus`, 
- `graphite` 

Each variant has `id`, `name`, `description`, and a `palette` object keyed by semantic role.

Role names match `ThemePalette` in [`themes/vscode/palettes/types.ts`](../vscode/palettes/types.ts).

---

## Format

- **version**: schema version (currently `1`).
- **paletteRoles**: short glossary for each palette key (documentation only).
- **variants**: array of variant objects, each with:
  - **`id`**: stable slug (`classic`, `espresso`, `nautilus`, `graphite`)
  - **`name`**: display label
  - **`description`**: one-line mood / cast summary
  - **`palette`**: `#RRGGBB` strings for every role

## Source of truth

| Consumer | Authoritative palette source |
| --- | --- |
| **VS Code** | [`themes/vscode/palettes/variants/*.ts`](../vscode/palettes/variants/) — run `jiti palettes/generate.ts` in `themes/vscode` after edits |
| **This JSON** | Should stay in sync with those `.ts` files when palettes change |
| **Zed / Chrome** | Today maintained separately; use this file as the shared reference when updating them |

The VS Code extension does not read `palettes.json` at build time; generation still flows from TypeScript variants.

## Mapping notes (by editor)

### VS Code

Workbench colors are produced by remapping the Graphite theme JSON through each variant palette (`themes/vscode/palettes/generate.ts`). Typical role → workbench keys:

| Role | Examples |
| --- | --- |
| `chromeBg` | `titleBar.activeBackground`, `statusBar.background`, `activityBar.background` |
| `editorBg` | `editor.background` |
| `sidebarBg` | `sideBar.background` |
| `accent` | `focusBorder`, `button.background`, `list.activeSelectionForeground` |
| `fg` / `fgMuted` / `fgSecondary` | `foreground`, `descriptionForeground`, `sideBar.foreground` |
| `border` / `panelBorder` | `panel.border`, `sideBar.border` |

Syntax `tokenColors` are shared across variants (Graphite baseline).

### Zed

Map palette roles into Zed `style` keys, for example:

| Role | Zed style key (examples) |
| --- | --- |
| `chromeBg` | `background`, `status_bar.background`, `title_bar.background` |
| `editorBg` | `editor.background`, `element.background` |
| `sidebarBg` | `panel.background`, `tab_bar.background` |
| `accent` | `text.accent`, `icon.accent`, `border.selected` |
| `fg` / `fgMuted` | `text`, `text.muted` |
| `border` / `chromeBorder` | `border`, `border.variant` |

Accent arrays often pull from `error`, `warning`, `accent`, `success`, `info`, `purple`.

### Chrome

Chromium themes use RGB triplets in `manifest.json` under `theme.colors`. Common mappings:

| Role | Chrome key (examples) |
| --- | --- |
| `chromeBg` | `frame`, `frame_inactive` |
| `editorBg` | `toolbar`, `ntp_background` |
| `fg` | `toolbar_text`, `bookmark_text` |
| `accent` | `tab_text`, `button_background` (tinted) |

Convert hex → `[r, g, b]` (0–255) per channel.

## Workflow

1. Change palette values in `themes/vscode/palettes/variants/<variant>.ts` (or update `palettes.json` first, then mirror into `.ts`).
2. Regenerate VS Code JSON: `cd themes/vscode && jiti palettes/generate.ts`.
3. Update `palettes.json` if it was not updated in step 1.
4. Apply the same hex values to Zed / Chrome theme files using the mappings above.
