// Terminal writers read only authored ANSI and terminal blocks. Missing blocks
// and excluded targets are reported rather than filled with untested colours.
import { at } from "../model/resolve.ts";
import { ANSI_SLOTS, TERMINAL_KEYS } from "../model/types.ts";
import type { ModeName, ResolvedFamily } from "../model/types.ts";
import { familyId, json, modesOf, textHeader } from "./common.ts";
import type { ExportFile, ExportOptions, Generator } from "./types.ts";

export function terminalUnavailable(family: ResolvedFamily, options?: ExportOptions): string | undefined {
  const modes = modesOf(options);
  if (family.source.targets?.exclude?.includes("terminals")) return "The family excludes terminal themes.";
  for (const mode of modes) {
    const colours = family.modes[mode].colours;
    if (ANSI_SLOTS.some((slot) => !colours.has(`ansi.${slot}`)) || TERMINAL_KEYS.some((key) => !colours.has(`terminal.${key}`))) {
      return `The family has no complete authored terminal palette in ${mode} mode.`;
    }
    for (const address of [...ANSI_SLOTS.map((slot) => `ansi.${slot}`), ...TERMINAL_KEYS.map((key) => `terminal.${key}`)]) {
      if (at(family.modes[mode], address).alpha !== undefined) return `${mode} ${address} is translucent; terminal themes require opaque colours.`;
    }
  }
  return undefined;
}

type Writer = (family: ResolvedFamily, mode: ModeName) => ExportFile;
const perMode = (id: string, label: string, writer: Writer): Generator => {
  const reasonFor = (family: ResolvedFamily, options?: ExportOptions) => {
    if (family.source.targets?.exclude?.includes(id)) return `The family excludes ${id}.`;
    return terminalUnavailable(family, options);
  };
  return {
    id, label, unavailable: reasonFor,
    generate(family, options) {
      const reason = reasonFor(family, options);
      if (reason) throw new Error(`${family.meta.id}: ${reason}`);
      familyId(family);
      return modesOf(options).map((mode) => writer(family, mode));
    },
  };
};

const terminal = (family: ResolvedFamily, mode: ModeName) => {
  const hex = (address: string) => at(family.modes[mode], address).hex;
  return {
    bg: hex("terminal.background"), fg: hex("terminal.foreground"),
    cursor: hex("terminal.cursor"), cursorText: hex("terminal.cursor-text"),
    selectionBg: hex("terminal.selection-background"), selectionFg: hex("terminal.selection-foreground"),
    ansi: ANSI_SLOTS.map((slot) => hex(`ansi.${slot}`)),
  };
};

export const ghostty = perMode("ghostty", "Ghostty", (family, mode) => {
  const t = terminal(family, mode);
  const content = textHeader(family)
    + `background = ${t.bg}\nforeground = ${t.fg}\ncursor-color = ${t.cursor}\ncursor-text = ${t.cursorText}\n`
    + `selection-background = ${t.selectionBg}\nselection-foreground = ${t.selectionFg}\n`
    + t.ansi.map((hex, i) => `palette = ${i}=${hex}\n`).join("");
  return { name: `${family.meta.id}-${mode}`, content, mime: "text/plain" };
});

export const kitty = perMode("kitty", "kitty", (family, mode) => {
  const t = terminal(family, mode);
  const content = textHeader(family)
    + `background ${t.bg}\nforeground ${t.fg}\ncursor ${t.cursor}\ncursor_text_color ${t.cursorText}\n`
    + `selection_background ${t.selectionBg}\nselection_foreground ${t.selectionFg}\n`
    + t.ansi.map((hex, i) => `color${i} ${hex}\n`).join("");
  return { name: `${family.meta.id}-${mode}.conf`, content, mime: "text/plain" };
});

export const alacritty = perMode("alacritty", "Alacritty", (family, mode) => {
  const t = terminal(family, mode);
  const slots = (offset: number) => ANSI_SLOTS.slice(0, 8).map((slot, i) => `${slot} = ${JSON.stringify(t.ansi[i + offset])}\n`).join("");
  const content = textHeader(family)
    + `[colors.primary]\nbackground = "${t.bg}"\nforeground = "${t.fg}"\n\n`
    + `[colors.cursor]\ntext = "${t.cursorText}"\ncursor = "${t.cursor}"\n\n`
    + `[colors.selection]\ntext = "${t.selectionFg}"\nbackground = "${t.selectionBg}"\n\n`
    + `[colors.normal]\n${slots(0)}\n[colors.bright]\n${slots(8)}`;
  return { name: `${family.meta.id}-${mode}.toml`, content, mime: "application/toml" };
});

export const windowsTerminal = perMode("windows-terminal", "Windows Terminal", (family, mode) => {
  const t = terminal(family, mode);
  const names = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"];
  const scheme = {
    name: `${family.meta.name} ${family.modes[mode].label ?? mode}`,
    background: t.bg, foreground: t.fg, cursorColor: t.cursor, selectionBackground: t.selectionBg,
    ...Object.fromEntries(names.flatMap((name, i) => [
      [name, t.ansi[i]], [`bright${name[0]!.toUpperCase()}${name.slice(1)}`, t.ansi[i + 8]],
    ])),
  };
  return { name: `${family.meta.id}-${mode}.windowsterminal.json`, content: json(scheme), mime: "application/json" };
});

export const wezterm = perMode('wezterm', 'WezTerm', (family, mode) => {
  const t=terminal(family,mode),q=(s:string)=>JSON.stringify(s);
  const content=textHeader(family).replace(/^# /,'-- ')+`-- Save as ~/.config/wezterm/colors/${family.meta.id}-${mode}.lua\n-- Load with config.colors = dofile(path_to_this_file).\nreturn {\n  foreground=${q(t.fg)}, background=${q(t.bg)}, cursor_bg=${q(t.cursor)}, cursor_fg=${q(t.cursorText)}, cursor_border=${q(t.cursor)}, selection_bg=${q(t.selectionBg)}, selection_fg=${q(t.selectionFg)},\n  ansi={${t.ansi.slice(0,8).map(q).join(', ')}},\n  brights={${t.ansi.slice(8).map(q).join(', ')}},\n}\n`;
  return {name:`${family.meta.id}-${mode}.lua`,content,mime:'text/x-lua'};
});
export const tmux = perMode('tmux','tmux',(family,mode)=>{
  const hex=(r:string)=>at(family.modes[mode],`roles.${r}`).hex;
  const content=textHeader(family)+`set -g status-style "bg=${hex('surface')},fg=${hex('text-muted')}"\nset -g window-status-current-style "fg=${hex('text')},bold,underscore"\nset -g pane-border-style "fg=${hex('border')}"\nset -g pane-active-border-style "fg=${hex('focus')}"\nset -g message-style "bg=${hex('surface')},fg=${hex('text')}"\nset -g mode-style "bg=${hex('selection')},fg=${hex('text')}"\n`;
  return {name:`${family.meta.id}-${mode}.conf`,content,mime:'text/plain'};
});
export const iterm2=perMode('iterm2','iTerm2',(family,mode)=>{
  const t=terminal(family,mode);
  const entries=[...t.ansi.map((hex,i)=>[`Ansi ${i} Color`,hex]),['Background Color',t.bg],['Foreground Color',t.fg],['Cursor Color',t.cursor],['Cursor Text Color',t.cursorText],['Selection Color',t.selectionBg],['Selected Text Color',t.selectionFg]];
  const channels=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const content=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${textHeader(family).slice(2).trim()} -->\n<plist version="1.0"><dict>\n`+entries.map(([key,hex])=>{
    const [r,g,b]=channels(hex!);
    return `<key>${key}</key><dict><key>Color Space</key><string>sRGB</string><key>Alpha Component</key><real>1</real><key>Red Component</key><real>${r}</real><key>Green Component</key><real>${g}</real><key>Blue Component</key><real>${b}</real></dict>`;
  }).join('\n')+'\n</dict></plist>\n';
  return {name:`${family.meta.id}-${mode}.itermcolors`,content,mime:'application/xml'};
});
