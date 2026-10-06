import { familyId, modesOf, provenance } from "./common.ts";
import { editorUnavailable, editorView, styleFlags } from "./editor-view.ts";
import type { Generator } from "./types.ts";

type Highlight = Record<string, string | boolean>;
const q = (s: string): string => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\x00-\x1f\x7f]/g, (c) => `\\${c.charCodeAt(0).toString().padStart(3, "0")}`)}"`;
const highlight = (name: string, value: Highlight): string =>
  `hi(${q(name)}, { ${Object.entries(value).map(([key, v]) => `${key} = ${typeof v === "string" ? q(v) : v}`).join(", ")} })`;

export const neovim: Generator = {
  id: "neovim", label: "Neovim colourscheme (Lua)",
  unavailable: (family, options) => editorUnavailable(family, "neovim", options),
  generate(family, options) {
    const reason = editorUnavailable(family, "neovim", options);
    if (reason) throw new Error(`${family.meta.id}: ${reason}`);
    const id = familyId(family);
    return modesOf(options).map((mode) => {
      const v = editorView(family, mode), r = v.roles;
      const syntax = (role: keyof typeof v.syntax): Highlight => ({ fg: v.syntax[role].hex, ...styleFlags(v.syntax[role]) });
      const groups: Record<string, Highlight> = {
        Normal: { fg: v.syntax.variable.hex, bg: v.background }, NormalNC: { fg: v.syntax.variable.hex, bg: v.background },
        NormalFloat: { fg: r.text, bg: r["surface-raised"] }, FloatBorder: { fg: r.border, bg: r["surface-raised"] },
        Cursor: { fg: v.terminal?.cursorText ?? v.background, bg: v.terminal?.cursor ?? r.text },
        Comment: syntax("comment"), String: syntax("string"), Character: syntax("string"),
        Number: syntax("number"), Float: syntax("number"), Boolean: syntax("number"), Constant: syntax("constant"),
        Identifier: syntax("variable"), Function: syntax("function"), Statement: syntax("keyword"), Keyword: syntax("keyword"),
        Conditional: syntax("keyword"), Repeat: syntax("keyword"), Operator: syntax("operator"), Exception: syntax("keyword"),
        PreProc: syntax("decorator"), Include: syntax("keyword"), Define: syntax("decorator"), Macro: syntax("decorator"),
        Type: syntax("type"), StorageClass: syntax("keyword"), Structure: syntax("type"), Typedef: syntax("type"),
        Special: syntax("constant"), Delimiter: syntax("punctuation"),
        Underlined: { fg: r.link, underline: true }, Title: { fg: r.text, bold: true },
        Todo: { fg: r["on-button"], bg: r.button, bold: true },
        LineNr: { fg: r["text-subtle"], bg: v.background }, CursorLineNr: { fg: r.text, bold: true },
        CursorLine: { bg: v.line }, ColorColumn: { bg: v.line },
        Visual: { bg: v.selection }, VisualNOS: { bg: v.selection },
        SignColumn: { bg: v.background }, WinSeparator: { fg: r.border }, VertSplit: { fg: r.border },
        StatusLine: { fg: r.text, bg: r.surface }, StatusLineNC: { fg: r["text-muted"], bg: r.surface },
        TabLine: { fg: r["text-muted"], bg: r.surface }, TabLineSel: { fg: r.text, bg: v.background, bold: true }, TabLineFill: { bg: r.surface },
        Pmenu: { fg: r.text, bg: r.surface }, PmenuSel: { fg: r.text, bg: r.selection },
        PmenuSbar: { bg: r.surface }, PmenuThumb: { bg: r["text-subtle"] },
        Search: { fg: r["on-button"], bg: r.button }, IncSearch: { fg: r["on-button"], bg: r.button }, CurSearch: { fg: r["on-button"], bg: r.button },
        MatchParen: { underline: true, bold: true }, NonText: { fg: r.border }, Whitespace: { fg: r.border },
        EndOfBuffer: { fg: r.border }, Directory: { fg: r.link },
        Error: { fg: v.status.error }, ErrorMsg: { fg: v.status.error }, WarningMsg: { fg: v.status.warning },
        DiffAdd: { underline: true }, DiffDelete: { strikethrough: true }, DiffChange: { underline: true }, DiffText: { bold: true, underline: true },
        DiagnosticError: { fg: v.status.error }, DiagnosticWarn: { fg: v.status.warning },
        DiagnosticInfo: { fg: v.status.info }, DiagnosticHint: { fg: v.status.hint },
        DiagnosticUnderlineError: { sp: v.status.error, undercurl: true }, DiagnosticUnderlineWarn: { sp: v.status.warning, undercurl: true },
        DiagnosticUnderlineInfo: { sp: v.status.info, undercurl: true }, DiagnosticUnderlineHint: { sp: v.status.hint, undercurl: true },
        "@comment": { link: "Comment" }, "@string": { link: "String" }, "@string.escape": { link: "Constant" },
        "@number": { link: "Number" }, "@boolean": { link: "Boolean" }, "@keyword": { link: "Keyword" },
        "@function": { link: "Function" }, "@function.call": { link: "Function" }, "@type": { link: "Type" }, "@constant": { link: "Constant" },
        "@variable": syntax("variable"), "@variable.parameter": syntax("parameter"), "@variable.member": syntax("variable"),
        "@operator": { link: "Operator" }, "@punctuation.bracket": { link: "Delimiter" }, "@punctuation.delimiter": { link: "Delimiter" },
        "@attribute": syntax("decorator"), "@tag": syntax("keyword"),
        "@markup.heading": { fg: r.text, bold: true }, "@markup.link.url": { fg: r.link, underline: true }, "@markup.raw": syntax("string"),
        "@lsp.type.comment": { link: "Comment" }, "@lsp.type.string": { link: "String" }, "@lsp.type.number": { link: "Number" },
        "@lsp.type.keyword": { link: "Keyword" }, "@lsp.type.function": { link: "Function" }, "@lsp.type.method": { link: "Function" },
        "@lsp.type.type": { link: "Type" }, "@lsp.type.class": { link: "Type" }, "@lsp.type.namespace": { link: "Type" },
        "@lsp.type.variable": { link: "@variable" }, "@lsp.type.parameter": { link: "@variable.parameter" },
        "@lsp.type.property": { link: "@variable.member" }, "@lsp.type.decorator": { link: "@attribute" }, "@lsp.type.enumMember": { link: "Constant" },
      };
      const name = `${id}-${mode}`;
      const lines = [
        `-- ${provenance(family).replace(/[\r\n]/g, " ")}`,
        `-- Save in ~/.config/nvim/colors/${name}.lua and use :colorscheme ${name}`,
        'vim.cmd("highlight clear")', 'if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end',
        "vim.o.termguicolors = true", `vim.o.background = ${q(mode)}`, `vim.g.colors_name = ${q(name)}`,
        "local function hi(group, spec) vim.api.nvim_set_hl(0, group, spec) end",
        ...Object.entries(groups).map(([group, spec]) => highlight(group, spec)),
        ...(v.terminal?.ansi.map((hex, i) => `vim.g.terminal_color_${i} = ${q(hex)}`) ?? []),
      ];
      return { name: `${name}.lua`, content: lines.join("\n") + "\n", mime: "text/x-lua" };
    });
  },
};
