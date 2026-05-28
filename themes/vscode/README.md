# Zenkai

Zenkai is a Monokai-derived VS Code theme set that keeps the familiar Monokai Pro syntax palette while softening the workbench UI. The chrome stays flatter, lower-contrast, and lightly bordered, with variant palettes layered on top of the same baseline structure.

## Included Themes

- `Zenkai Classic`
- `Zenkai Espresso`
- `Zenkai Nautilus`
- `Zenkai Graphite`

## Customization

Zenkai includes settings-backed workbench customization for its bundled themes. When one of the supported Zenkai themes is active, the extension writes theme-scoped `workbench.colorCustomizations` entries on your behalf and keeps unrelated theme overrides intact.

- `zenkai.accentCustomColor`: provide a custom `#RRGGBB` accent; leave it blank to keep the bundled theme accent
- `zenkai.contrast`: choose `default`, `softer`, or `stronger`
- `zenkai.border`: choose `default`, `subtle`, or `defined`
- `zenkai.popupTransparency`: choose a popup menu opacity value from `0` to `1`

## Notes

- Used the original Monokai Pro themes as a reference for syntax colors, but the workbench UI is a custom design inspired by the original's softer, flatter style.
- Syntax colors stay aligned with the base Monokai Pro theme across every variant.
- The bundled theme JSON files are generated from `themes/src/`; edit the source inputs and regenerate rather than hand-editing `themes/*.json`.
- Variant differences are UI-surface remaps only; borders, transparency, shadows, and interaction styling stay structurally consistent.

## Development

- `npm run generate:themes`: regenerate the bundled `themes/*.json` files from `themes/src/`.
- `npm run build`: deletes the existing packaged `.vsix`, refreshes the installed extension in the active VS Code CLI, runs tests, and builds a fresh `.vsix`.
- `npm test`: runs Node's built-in test runner with `node --test`.
- `npm run package`: runs `npm run build`.
