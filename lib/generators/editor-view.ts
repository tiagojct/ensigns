// Shared editor view. Use resolved surfaces verbatim: changing their opacity
// would make the emitted themes differ from the editor harness measurements.
import { at } from "../model/resolve.ts";
import { ANSI_SLOTS, CORE_ROLES, SYNTAX_ROLES } from "../model/types.ts";
import type { CoreRole, ModeName, Resolved, ResolvedFamily, SyntaxRole } from "../model/types.ts";
import { modesOf } from "./common.ts";
import { terminalUnavailable } from "./terminals.ts";
import type { ExportOptions } from "./types.ts";

export const EDITOR_SURFACES = ["editor", "editor-line", "editor-selection"] as const;

export function editorUnavailable(family: ResolvedFamily, target: string, options?: ExportOptions): string | undefined {
  const modes = modesOf(options);
  if (family.source.targets?.exclude?.includes(target)) return `The family excludes ${target}.`;
  for (const mode of modes) {
    const colours = family.modes[mode].colours;
    for (const role of SYNTAX_ROLES) {
      const colour = colours.get(`syntax.${role}`);
      if (!colour) return `The family has no complete authored syntax palette in ${mode} mode.`;
      if (colour.alpha !== undefined) return `${mode} syntax.${role} is translucent; editor syntax requires opaque colours.`;
      if (target === "zed" && (colour.style === "underline" || colour.style === "strikethrough")) {
        return `Zed does not support ${colour.style} for ${mode} syntax.${role}.`;
      }
    }
    if (family.meta.environments.includes("editor")) {
      for (const surface of EDITOR_SURFACES) {
        if (!colours.has(`surfaces.${surface}`)) return `The editor profile needs surfaces.${surface} in ${mode} mode.`;
      }
    }
    for (const address of [...CORE_ROLES.map((role) => `roles.${role}`), ...EDITOR_SURFACES.map((surface) => `surfaces.${surface}`)]) {
      if (colours.get(address)?.alpha !== undefined) return `${mode} ${address} is translucent; editor surfaces require opaque resolved colours.`;
    }
  }
  return undefined;
}

export function editorView(family: ResolvedFamily, mode: ModeName) {
  const colours = family.modes[mode];
  const hex = (address: string) => at(colours, address).hex;
  const roles = Object.fromEntries(CORE_ROLES.map((role) => [role, hex(`roles.${role}`)])) as Record<CoreRole, string>;
  const syntax = Object.fromEntries(SYNTAX_ROLES.map((role) => [role, at(colours, `syntax.${role}`)])) as Record<SyntaxRole, Resolved>;
  const surface = (name: string, fallback: CoreRole) => colours.colours.get(`surfaces.${name}`)?.hex ?? roles[fallback];
  const status = family.source.modes[mode].status;
  // UI status remains achromatic for Rosebud. The editor supplies icons and words.
  const statusColour = (chromatic: string, achromatic: string, fallback: CoreRole = "text-muted") =>
    colours.colours.get(`status.${status?.policy === "achromatic" ? `${achromatic}.accent` : chromatic}`)?.hex ?? roles[fallback];
  return {
    roles, syntax,
    background: surface("editor", "bg"),
    line: surface("editor-line", "surface"),
    selection: surface("editor-selection", "selection"),
    sidebar: surface("sidebar", "surface"),
    status: {
      error: statusColour("danger", "critical"), warning: statusColour("warning", "warning"),
      info: statusColour("info", "neutral"), hint: statusColour("hint", "neutral"),
      success: statusColour("success", "success"), conflict: statusColour("conflict", "critical"),
    },
    terminal: terminalUnavailable(family, { mode }) ? undefined : {
      background: hex("terminal.background"), foreground: hex("terminal.foreground"),
      cursor: hex("terminal.cursor"), cursorText: hex("terminal.cursor-text"),
      selectionBackground: hex("terminal.selection-background"), selectionForeground: hex("terminal.selection-foreground"),
      ansi: ANSI_SLOTS.map((slot) => hex(`ansi.${slot}`)),
    },
  };
}

export const styleFlags = (colour: Resolved) => ({
  bold: colour.style?.includes("bold") ?? false,
  italic: colour.style?.includes("italic") ?? false,
  underline: colour.style === "underline",
  strikethrough: colour.style === "strikethrough",
});
