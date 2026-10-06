import { ANSI_SLOTS } from "../model/types.ts";
import type { Resolved } from "../model/types.ts";
import { familyId, json, modesOf, provenance } from "./common.ts";
import { editorUnavailable, editorView, styleFlags } from "./editor-view.ts";
import type { Generator } from "./types.ts";

export const zed: Generator = {
  id: "zed", label: "Zed theme",
  unavailable: (family, options) => editorUnavailable(family, "zed", options),
  generate(family, options) {
    const reason = editorUnavailable(family, "zed", options);
    if (reason) throw new Error(`${family.meta.id}: ${reason}`);
    const modes = modesOf(options);
    const themes = modes.map((mode) => {
      const v = editorView(family, mode), r = v.roles, s = v.syntax;
      const syn = (colour: Resolved) => ({ color: colour.hex, font_style: styleFlags(colour).italic ? "italic" : "normal", font_weight: styleFlags(colour).bold ? 700 : 400 });
      const style: Record<string, unknown> = {
        background: r.bg, "background.appearance": "opaque", "surface.background": r.surface, "elevated_surface.background": r["surface-raised"],
        border: r.border, "border.variant": r.border, "border.focused": r.focus, "border.selected": r.accent,
        text: r.text, "text.muted": r["text-muted"], "text.placeholder": r["text-subtle"], "text.accent": r.accent,
        "element.background": r.surface, "element.hover": r.selection, "element.selected": r.selection,
        "ghost_element.hover": r.selection, "ghost_element.selected": r.selection,
        icon: r.text, "icon.muted": r["text-muted"], "icon.accent": r.accent,
        "status_bar.background": r.surface, "title_bar.background": r.surface, "toolbar.background": v.background,
        "tab_bar.background": r.surface, "tab.active_background": v.background, "tab.inactive_background": r.surface,
        "panel.background": v.sidebar, "pane.focused_border": r.focus,
        "scrollbar.thumb.background": r["text-subtle"], "scrollbar.track.background": r.bg,
        "editor.background": v.background, "editor.foreground": s.variable.hex, "editor.gutter.background": v.background,
        "editor.active_line.background": v.line, "editor.highlighted_line.background": v.line,
        "editor.line_number": r["text-subtle"], "editor.active_line_number": r.text, "editor.invisible": r.border,
        "editor.wrap_guide": r.border, "search.match_background": v.selection, "link_text.hover": r["link-hover"],
        error: v.status.error, warning: v.status.warning, info: v.status.info, hint: v.status.hint,
        success: v.status.success, created: v.status.success, deleted: v.status.error, modified: v.status.warning, conflict: v.status.conflict,
        players: [{ cursor: v.terminal?.cursor ?? r.text, background: v.background, selection: v.selection }],
        syntax: {
          ...Object.fromEntries(Object.entries(s).map(([role, colour]) => [role, syn(colour)])),
          attribute: syn(s.decorator), boolean: syn(s.number), "comment.doc": syn(s.comment), constructor: syn(s.type),
          enum: syn(s.type), property: syn(s.variable), "variable.special": syn(s.parameter),
          "punctuation.bracket": syn(s.punctuation), "punctuation.delimiter": syn(s.punctuation),
          "string.escape": syn(s.constant), "string.regex": syn(s.string), tag: syn(s.keyword),
        },
      };
      if (v.terminal) {
        Object.assign(style, { "terminal.background": v.terminal.background, "terminal.foreground": v.terminal.foreground, "terminal.bright_foreground": v.terminal.foreground });
        ANSI_SLOTS.forEach((slot, i) => { style[`terminal.ansi.${slot.replace("bright-", "bright_")}`] = v.terminal!.ansi[i]; });
      }
      return { name: `${family.meta.name} ${family.modes[mode].label ?? mode} (Ensigns)`, appearance: mode, style };
    });
    const suffix = modes.length === 1 ? `-${modes[0]}` : "";
    return [{ name: `${familyId(family)}${suffix}-zed.json`, mime: "application/json", content: json({
      $schema: "https://zed.dev/schema/themes/v0.2.0.json", $comment: provenance(family),
      name: `${family.meta.name} (Ensigns)`, author: "Tiago Jacinto", themes,
    }) }];
  },
};
