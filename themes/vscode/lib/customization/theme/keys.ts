// Accent-driven keys are recolored when the user supplies a custom accent.
export const ACCENT_COLOR_KEYS = Object.freeze([
  "activityBar.foreground",
  "activityBarTop.foreground",
  "activityBarBadge.background",
  "checkbox.foreground",
  "debugConsoleInputIcon.foreground",
  "debugIcon.breakpointCurrentStackframeForeground",
  "debugView.valueChangedHighlight",
  "editor.findMatchBorder",
  "editorLightBulb.foreground",
  "editorLightBulbAi.foreground",
  "gitDecoration.modifiedResourceForeground",
  "gitDecoration.stageModifiedResourceForeground",
  "list.activeSelectionForeground",
  "list.inactiveSelectionForeground",
  "menu.selectionForeground",
  "notificationLink.foreground",
  "panelTitle.activeForeground",
  "panelTitleBadge.background",
  "radio.activeForeground",
  "settings.checkboxForeground",
  "settings.headerForeground",
  "settings.modifiedItemIndicator",
  "tab.activeForeground",
  "testing.runAction",
  "textLink.foreground",
]) as readonly string[];

// Keep active-item indicators hidden and clear accent overrides written by older releases.
export const HIDDEN_ACTIVE_INDICATOR_KEYS = Object.freeze([
  "activityBar.activeBorder",
  "activityBar.activeFocusBorder",
  "panelTitle.activeBorder",
  "tab.activeBorder",
]) as readonly string[];

export const ACCENT_ALPHA_KEYS = Object.freeze([
  "editor.findMatchBackground",
  "editor.findMatchHighlightBackground",
  "list.activeSelectionBackground",
  "list.inactiveSelectionBackground",
]) as readonly string[];

// Popup surfaces share the transparency treatment so menus/widgets stay visually aligned.
export const POPUP_BACKGROUND_KEYS = Object.freeze([
  "debugExceptionWidget.background",
  "dropdown.background",
  "dropdown.listBackground",
  "editorHoverWidget.background",
  "editorSuggestWidget.background",
  "editorWidget.background",
  "menu.background",
  "menu.separatorBackground",
  "quickInput.background",
]) as readonly string[];

// Terminal background mirrors the sidebar when the user opts in.
export const TERMINAL_MATCH_KEYS = Object.freeze(["terminal.background"]) as readonly string[];

// Sidebar background is the source color copied onto the terminal.
export const SIDEBAR_BACKGROUND_KEY = "sideBar.background";

// Keys the extension no longer writes but must still prune from settings left by older releases.
// (1.0.x briefly pinned panel.background to recolor the terminal tabs container.)
export const LEGACY_MANAGED_KEYS = Object.freeze(["panel.background"]) as readonly string[];

// All keys managed by this extension. Existing values for these keys are cleared before reapplying.
export const MANAGED_COLOR_KEYS = Object.freeze(
  Array.from(
    new Set([
      ...ACCENT_COLOR_KEYS,
      ...HIDDEN_ACTIVE_INDICATOR_KEYS,
      ...ACCENT_ALPHA_KEYS,
      ...POPUP_BACKGROUND_KEYS,
      ...TERMINAL_MATCH_KEYS,
      ...LEGACY_MANAGED_KEYS,
    ])
  )
) as readonly string[];
