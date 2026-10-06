import { ANSI_SLOTS, SYNTAX_ROLES } from "../model/types.ts";
import { familyId, json, modesOf, provenance } from "./common.ts";
import { editorUnavailable, editorView } from "./editor-view.ts";
import type { Generator } from "./types.ts";

const SCOPES = {
  keyword: ["keyword", "keyword.control", "storage.type", "storage.modifier"],
  string: ["string", "string.quoted", "punctuation.definition.string"],
  number: ["constant.numeric", "constant.language.boolean"],
  comment: ["comment", "punctuation.definition.comment"],
  function: ["entity.name.function", "meta.function-call", "support.function"],
  type: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.name.namespace"],
  constant: ["constant", "variable.other.constant", "entity.name.constant"],
  variable: ["variable", "variable.other", "meta.definition.variable"],
  operator: ["keyword.operator"], punctuation: ["punctuation", "meta.brace", "punctuation.separator"],
  decorator: ["meta.decorator", "entity.name.function.decorator", "meta.annotation"], parameter: ["variable.parameter"],
};

export const vscode: Generator = {
  id: "vscode", label: "VS Code theme",
  unavailable: (family, options) => editorUnavailable(family, "vscode", options),
  generate(family, options) {
    const reason = editorUnavailable(family, "vscode", options);
    if (reason) throw new Error(`${family.meta.id}: ${reason}`);
    const id = familyId(family);
    const modes = modesOf(options);
    const themes = modes.map((mode) => {
      const v = editorView(family, mode);
      const r = v.roles;
      const syntaxStyle = (role: keyof typeof v.syntax) => ({ foreground: v.syntax[role].hex, fontStyle: v.syntax[role].style ?? "" });
      const colors: Record<string, string> = {
        foreground: r.text, descriptionForeground: r["text-muted"], focusBorder: r.focus,
        "editor.background": v.background, "editor.foreground": v.syntax.variable.hex,
        "editor.lineHighlightBackground": v.line, "editor.selectionBackground": v.selection,
        "editor.inactiveSelectionBackground": v.selection,
        "editorCursor.foreground": v.terminal?.cursor ?? r.text,
        "editorLineNumber.foreground": r["text-subtle"], "editorLineNumber.activeForeground": r.text,
        "editorIndentGuide.background1": r.border, "editorWhitespace.foreground": r.border,
        "editorBracketMatch.border": r.accent, "editorGutter.background": v.background,
        "editorWidget.background": r.surface, "editorWidget.border": r.border,
        "editorSuggestWidget.background": r.surface, "editorSuggestWidget.selectedBackground": v.selection,
        "sideBar.background": v.sidebar, "sideBar.foreground": r.text, "sideBar.border": r.border,
        "activityBar.background": r.surface, "activityBar.foreground": r.text,
        "activityBar.activeBorder": r.accent, "activityBarBadge.background": r.button, "activityBarBadge.foreground": r["on-button"],
        "statusBar.background": r.surface, "statusBar.foreground": r["text-muted"],
        "statusBar.debuggingBackground": r.button, "statusBar.debuggingForeground": r["on-button"],
        "titleBar.activeBackground": r.surface, "titleBar.activeForeground": r.text,
        "tab.activeBackground": v.background, "tab.activeForeground": r.text,
        "tab.inactiveBackground": r.surface, "tab.inactiveForeground": r["text-muted"],
        "tab.activeBorderTop": r.accent, "editorGroupHeader.tabsBackground": r.surface,
        "panel.background": v.background, "panel.border": r.border, "panelTitle.activeBorder": r.accent,
        "list.activeSelectionBackground": r.selection, "list.activeSelectionForeground": r.text,
        "list.hoverBackground": r.surface, "list.focusOutline": r.focus,
        "input.background": r.bg, "input.foreground": r.text, "input.border": r.border,
        "input.placeholderForeground": r["text-subtle"], "dropdown.background": r.surface, "dropdown.foreground": r.text,
        "button.background": r.button, "button.foreground": r["on-button"],
        "button.secondaryBackground": r.surface, "button.secondaryForeground": r.text,
        "badge.background": r.button, "badge.foreground": r["on-button"], "progressBar.background": r.accent,
        "textLink.foreground": r.link, "textLink.activeForeground": r["link-hover"],
        "notifications.background": r.surface, "notifications.foreground": r.text,
        "menu.background": r.surface, "menu.foreground": r.text,
        "errorForeground": v.status.error, "editorError.foreground": v.status.error,
        "editorWarning.foreground": v.status.warning, "editorInfo.foreground": v.status.info, "editorHint.foreground": v.status.hint,
        "gitDecoration.addedResourceForeground": v.status.success, "gitDecoration.deletedResourceForeground": v.status.error,
        "gitDecoration.modifiedResourceForeground": v.status.warning, "gitDecoration.conflictingResourceForeground": v.status.conflict,
        "diffEditor.insertedTextBorder": v.status.success, "diffEditor.removedTextBorder": v.status.error,
      };
      if (v.terminal) {
        Object.assign(colors, {
          "terminal.background": v.terminal.background, "terminal.foreground": v.terminal.foreground,
          "terminalCursor.foreground": v.terminal.cursor, "terminalCursor.background": v.terminal.cursorText,
          "terminal.selectionBackground": v.terminal.selectionBackground, "terminal.selectionForeground": v.terminal.selectionForeground,
        });
        ANSI_SLOTS.forEach((slot, i) => {
          const key = slot.split("-").map((part) => part[0]!.toUpperCase() + part.slice(1)).join("");
          colors[`terminal.ansi${key}`] = v.terminal!.ansi[i]!;
        });
      }
      return {
        name: `${id}-${mode}-color-theme.json`, mime: "application/json",
        content: json({
          $schema: "vscode://schemas/color-theme", $comment: provenance(family),
          name: `${family.meta.name} ${family.modes[mode].label ?? mode} (Ensigns)`, type: mode,
          semanticHighlighting: true, colors,
          tokenColors: SYNTAX_ROLES.map((role) => ({ name: role, scope: SCOPES[role], settings: syntaxStyle(role) })),
          semanticTokenColors: {
            ...Object.fromEntries(["comment", "string", "number", "keyword", "function", "type", "variable", "operator", "decorator", "parameter"].map((role) => [role, syntaxStyle(role as keyof typeof v.syntax)])),
            method: syntaxStyle("function"), class: syntaxStyle("type"), namespace: syntaxStyle("type"),
            interface: syntaxStyle("type"), struct: syntaxStyle("type"), enum: syntaxStyle("type"),
            enumMember: syntaxStyle("constant"), "variable.readonly": syntaxStyle("constant"), property: syntaxStyle("variable"),
          },
        }),
      };
    });
    return [...themes, {
      name: "package.json", mime: "application/json",
      content: json({
        $comment: provenance(family), name: `ensigns-${id}`, displayName: `Ensigns: ${family.meta.name}`,
        description: family.meta.goal, version: family.meta.version, publisher: "tiagojct",
        author: "Tiago Jacinto", license: "CC-BY-4.0", engines: { vscode: "^1.85.0" }, categories: ["Themes"],
        contributes: { themes: modes.map((mode) => ({
          label: `${family.meta.name} ${family.modes[mode].label ?? mode} (Ensigns)`,
          uiTheme: mode === "dark" ? "vs-dark" : "vs", path: `./${id}-${mode}-color-theme.json`,
        })) },
      }),
    }];
  },
};
