// Accent-driven keys are recolored when the user supplies a custom accent.
export const ACCENT_COLOR_KEYS = Object.freeze([
  "activityBar.foreground",
  "activityBar.activeFocusBorder",
  "activityBarTop.foreground",
  "activityBarBadge.background",
  "chat.slashCommandForeground",
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
  "panelTitle.activeBorder",
  "panelTitle.activeForeground",
  "panelTitleBadge.background",
  "radio.activeForeground",
  "settings.checkboxForeground",
  "settings.headerForeground",
  "settings.modifiedItemIndicator",
  "tab.activeBorder",
  "tab.activeForeground",
  "testing.runAction",
  "textLink.foreground",
]) as readonly string[];

export const ACCENT_ALPHA_KEYS = Object.freeze([
  "editor.findMatchBackground",
  "editor.findMatchHighlightBackground",
  "list.activeSelectionBackground",
  "list.inactiveSelectionBackground",
]) as readonly string[];

// Surface keys are adjusted together when chrome contrast changes.
export const CHROME_COLOR_KEYS = Object.freeze([
  "activityBar.background",
  "activityBarTop.background",
  "chat.requestBackground",
  "commandCenter.background",
  "debugExceptionWidget.background",
  "debugToolBar.background",
  "dropdown.background",
  "dropdown.listBackground",
  "editor.background",
  "editorHoverWidget.background",
  "editorPane.background",
  "editorSuggestWidget.background",
  "editorWidget.background",
  "menu.background",
  "panel.background",
  "quickInput.background",
  "sideBar.background",
  "statusBar.background",
  "terminal.background",
  "titleBar.activeBackground",
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

export const BORDER_BACKGROUND_KEYS = Object.freeze({
  "activityBar.border": "activityBar.background",
  "commandCenter.border": "commandCenter.background",
  "debugExceptionWidget.border": "debugExceptionWidget.background",
  "dropdown.border": "dropdown.background",
  "editorGroup.border": "editorPane.background",
  "editorHoverWidget.border": "editorHoverWidget.background",
  "editorStickyScroll.border": "editorStickyScroll.background",
  "editorSuggestWidget.border": "editorSuggestWidget.background",
  "editorWidget.border": "editorWidget.background",
  focusBorder: "editor.background",
  "input.border": "dropdown.background",
  "panel.border": "panel.background",
  "sideBar.border": "sideBar.background",
  "statusBar.border": "statusBar.background",
  "tab.border": "tab.activeBackground",
  "titleBar.border": "titleBar.activeBackground",
}) as Readonly<Record<string, string>>;

// All keys managed by this extension. Existing values for these keys are cleared before reapplying.
export const MANAGED_COLOR_KEYS = Object.freeze(
  Array.from(
    new Set([
      ...ACCENT_COLOR_KEYS,
      ...ACCENT_ALPHA_KEYS,
      ...CHROME_COLOR_KEYS,
      ...POPUP_BACKGROUND_KEYS,
      ...Object.keys(BORDER_BACKGROUND_KEYS),
    ])
  )
) as readonly string[];
