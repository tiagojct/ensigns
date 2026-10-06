// Pure generators, safe to import into the future Carpenter browser bundle.
export type { ExportFile, ExportOptions, Generator } from "./types.ts";
export { cssColour, scopeProperties } from "./css-properties.ts";
import type { ExportFile, ExportOptions, Generator } from "./types.ts";
import type { ResolvedFamily } from "../model/types.ts";
import { modesOf } from "./common.ts";
import { css, resolvedJson } from "./web.ts";
import { alacritty, ghostty, kitty, windowsTerminal, wezterm, tmux, iterm2 } from "./terminals.ts";
import { vscode } from "./vscode.ts";
import { zed } from "./zed.ts";
import { neovim } from "./neovim.ts";
import { obsidian } from "./obsidian.ts";

import { scss, tailwind3, tailwind4, dtcg, tokensStudio, quartoBrand, quartoScss, typst, latex, pandocCss, ggplot2, matplotlib, observable, gpl, ase, hexList } from './formats.ts';

export const GROUPS = [
  {id:'web',label:'Web',formats:['css','json','scss','tailwind3','tailwind4','dtcg','tokens-studio']},
  {id:'publishing',label:'Publishing',formats:['quarto-brand','quarto-scss','typst','latex','pandoc-css']},
  {id:'data',label:'Charts',formats:['ggplot2','matplotlib','observable']},
  {id:'editors',label:'Editors',formats:['vscode','zed','neovim','obsidian']},
  {id:'terminals',label:'Terminals',formats:['ghostty','kitty','alacritty','windows-terminal','wezterm','tmux','iterm2']},
  {id:'palettes',label:'Palette files',formats:['gpl','ase','hex']},
] as const;
export const GENERATORS: readonly Generator[] = [css, resolvedJson, scss, tailwind3, tailwind4, dtcg, tokensStudio, quartoBrand, quartoScss, typst, latex, pandocCss, ggplot2, matplotlib, observable, vscode, zed, neovim, obsidian, ghostty, kitty, alacritty, windowsTerminal, wezterm, tmux, iterm2, gpl, ase, hexList];

export interface ExportResult {
  generator: Generator;
  files: ExportFile[];
  /** Unavailable formats appear in the manifest with their reason. */
  reason?: string;
}

export function generateAll(family: ResolvedFamily, options: ExportOptions = {}): ExportResult[] {
  modesOf(options);
  return GENERATORS.map((generator) => {
    const reason = generator.unavailable(family, options);
    return reason ? { generator, files: [], reason } : { generator, files: generator.generate(family, options) };
  });
}
