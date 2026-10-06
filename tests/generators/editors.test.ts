import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import Ajv from "ajv";
import { describe, expect, it } from "vitest";
import { GENERATORS, generateAll } from "../../lib/generators/index.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { at, resolveFamily } from "../../lib/model/resolve.ts";
import { ANSI_SLOTS, MODES, SYNTAX_ROLES } from "../../lib/model/types.ts";
import type { ModeName, ResolvedFamily, Style } from "../../lib/model/types.ts";

const parseLua = createRequire(import.meta.url)("luaparse").parse as (source: string, options: object) => any;
const schema = JSON.parse(readFileSync(join(repoRoot(), "tests/generators/fixtures/zed/theme.schema.json"), "utf8"));
const validateZed = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true }).compile(schema);
const families = loadFamilies().map((family) => resolveFamily(family.file));
const generator = (id: string) => GENERATORS.find((entry) => entry.id === id)!;
const byId = (id: string) => families.find((family) => family.meta.id === id)!;
const editors = families.filter((family) => !generator("vscode").unavailable(family));

/** Read the generated Lua with an independent parser, then inspect the calls. */
function luaHighlights(source: string): Map<string, Record<string, string | boolean>> {
  const ast = parseLua(source, { luaVersion: "5.1", encodingMode: "x-user-defined" });
  const out = new Map<string, Record<string, string | boolean>>();
  for (const statement of ast.body) {
    if (statement.type !== "CallStatement" || statement.expression.base?.name !== "hi") continue;
    const [name, table] = statement.expression.arguments;
    expect(name.type).toBe("StringLiteral");
    expect(table.type).toBe("TableConstructorExpression");
    out.set(name.value, Object.fromEntries(table.fields.map((field: any) => [field.key.name, field.value.value])));
  }
  return out;
}

function surfaces(family: ResolvedFamily, mode: ModeName) {
  const colours = family.modes[mode];
  const expected = (surface: string, role: string) => colours.colours.get(`surfaces.${surface}`)?.hex ?? at(colours, `roles.${role}`).hex;
  return { background: expected("editor", "bg"), line: expected("editor-line", "surface"), selection: expected("editor-selection", "selection") };
}

describe("current editor themes", () => {
  it("offers the four authored editor families and respects every excluded target", () => {
    expect(editors.map((family) => family.meta.id).sort()).toEqual(["goney", "jungfrau", "pequod", "rosebud"]);
    for (const family of families) for (const id of ["vscode", "zed", "neovim"]) {
      const result = generateAll(family).find((result) => result.generator.id === id)!;
      if (family.source.targets?.exclude?.includes(id)) {
        expect(result.files).toEqual([]);
        expect(result.reason).toBe(`The family excludes ${id}.`);
        expect(() => result.generator.generate(family)).toThrow("excludes");
      } else expect(result.files.length).toBeGreaterThan(0);
    }
  });

  for (const family of editors) for (const mode of MODES) {
    it(`${family.meta.id} ${mode}: VS Code uses tested surfaces, semantic styles and authored diagnostics`, () => {
      const v = JSON.parse(generator("vscode").generate(family, { mode })[0]!.content as string);
      const expected = surfaces(family, mode), colours = family.modes[mode];
      expect(v.colors["editor.background"]).toBe(expected.background);
      expect(v.colors["editor.lineHighlightBackground"]).toBe(expected.line);
      expect(v.colors["editor.selectionBackground"]).toBe(expected.selection);
      expect(v.colors["editor.selectionForeground"]).toBeUndefined();
      expect(v.semanticHighlighting).toBe(true);
      expect(v.type).toBe(mode);
      for (const role of SYNTAX_ROLES) {
        const token = v.tokenColors.find((token: any) => token.name === role);
        expect(token.scope.length).toBeGreaterThan(0);
        expect(token.settings.foreground).toBe(at(colours, `syntax.${role}`).hex);
        expect(token.settings.fontStyle).toBe(at(colours, `syntax.${role}`).style ?? "");
      }
      expect(v.semanticTokenColors.parameter).toEqual(v.tokenColors.find((token: any) => token.name === "parameter").settings);
      expect(v.semanticTokenColors["variable.readonly"]).toEqual(v.tokenColors.find((token: any) => token.name === "constant").settings);
      const danger = family.source.modes[mode].status?.policy === "achromatic" ? "status.critical.accent" : "status.danger";
      expect(v.colors["editorError.foreground"]).toBe(at(colours, danger).hex);
      expect(v.colors["terminal.selectionBackground"]).toBe(at(colours, "terminal.selection-background").hex);
      ANSI_SLOTS.forEach((slot) => {
        const key = slot.split("-").map((part) => part[0]!.toUpperCase() + part.slice(1)).join("");
        expect(v.colors[`terminal.ansi${key}`]).toBe(at(colours, `ansi.${slot}`).hex);
      });
      expect(Object.values(v.colors).every((value) => [...colours.colours.values()].some((colour) => colour.hex === value))).toBe(true);
    });

    it(`${family.meta.id} ${mode}: Zed validates against the upstream schema and uses exact surfaces`, () => {
      const output = JSON.parse(generator("zed").generate(family, { mode })[0]!.content as string);
      expect(validateZed(output), JSON.stringify(validateZed.errors)).toBe(true);
      expect(output.themes).toHaveLength(1);
      const theme = output.themes[0], expected = surfaces(family, mode);
      expect(theme.appearance).toBe(mode);
      expect(theme.style["editor.background"]).toBe(expected.background);
      expect(theme.style["editor.active_line.background"]).toBe(expected.line);
      expect(theme.style.players[0].selection).toBe(expected.selection);
      // The upstream schema permits unknown properties; guard against silently ignored keys too.
      expect(Object.keys(theme.style).filter((key) => !(key in schema.definitions.ThemeStyleContent.properties))).toEqual([]);
      for (const role of SYNTAX_ROLES) {
        const colour = at(family.modes[mode], `syntax.${role}`);
        expect(theme.style.syntax[role].color).toBe(colour.hex);
        expect(theme.style.syntax[role].font_style).toBe(colour.style?.includes("italic") ? "italic" : "normal");
        expect(theme.style.syntax[role].font_weight).toBe(colour.style?.includes("bold") ? 700 : 400);
      }
      ANSI_SLOTS.forEach((slot) => expect(theme.style[`terminal.ansi.${slot.replace("bright-", "bright_")}`]).toBe(at(family.modes[mode], `ansi.${slot}`).hex));
    });

    it(`${family.meta.id} ${mode}: Neovim parses as Lua 5.1 and preserves surfaces and styles`, () => {
      const output = generator("neovim").generate(family, { mode })[0]!;
      const hl = luaHighlights(output.content as string), expected = surfaces(family, mode);
      expect(hl.size).toBeGreaterThan(70);
      expect(hl.get("Normal")?.bg).toBe(expected.background);
      expect(hl.get("CursorLine")?.bg).toBe(expected.line);
      expect(hl.get("Visual")?.bg).toBe(expected.selection);
      expect(hl.get("Visual")?.fg).toBeUndefined();
      expect(output.content).toContain(`vim.o.background = "${mode}"`);
      expect(output.content).toContain(`vim.g.colors_name = "${family.meta.id}-${mode}"`);
      for (const [role, group] of [["keyword", "Keyword"], ["string", "String"], ["comment", "Comment"], ["parameter", "@variable.parameter"], ["decorator", "@attribute"]]) {
        const colour = at(family.modes[mode], `syntax.${role}`);
        expect(hl.get(group!)?.fg).toBe(colour.hex);
        expect(hl.get(group!)?.bold).toBe(colour.style?.includes("bold") ?? false);
        expect(hl.get(group!)?.italic).toBe(colour.style?.includes("italic") ?? false);
      }
      for (const value of hl.values()) {
        for (const key of ["fg", "bg", "sp"]) if (value[key]) expect(value[key]).toMatch(/^#[0-9A-F]{6}$/);
        if (typeof value.link === "string") expect(hl.has(value.link), `missing highlight ${value.link}`).toBe(true);
      }
      ANSI_SLOTS.forEach((slot, i) => expect(output.content).toContain(`vim.g.terminal_color_${i} = "${at(family.modes[mode], `ansi.${slot}`).hex}"`));
      expect(hl.get("DiffAdd")?.underline).toBe(true);
      expect(hl.get("DiffDelete")?.strikethrough).toBe(true);
    });
  }

  it("preserves combined styles and reports styles that Zed cannot represent", () => {
    for (const style of ["bold italic", "underline", "strikethrough"] as Style[]) {
      const family = resolveFamily(byId("rosebud").source);
      at(family.modes.dark, "syntax.comment").style = style;
      const vs = JSON.parse(generator("vscode").generate(family, { mode: "dark" })[0]!.content as string);
      expect(vs.semanticTokenColors.comment.fontStyle).toBe(style);
      const hl = luaHighlights(generator("neovim").generate(family, { mode: "dark" })[0]!.content as string).get("Comment")!;
      expect(hl.bold).toBe(style.includes("bold"));
      expect(hl.italic).toBe(style.includes("italic"));
      expect(hl.underline).toBe(style === "underline");
      expect(hl.strikethrough).toBe(style === "strikethrough");
      if (style === "bold italic") {
        const zed = JSON.parse(generator("zed").generate(family, { mode: "dark" })[0]!.content as string);
        expect(zed.themes[0].style.syntax.comment).toEqual({ color: at(family.modes.dark, "syntax.comment").hex, font_weight: 700, font_style: "italic" });
      } else expect(generator("zed").unavailable(family, { mode: "dark" })).toContain("does not support");
    }
  });

  it("requires complete authored syntax and declared editor surfaces", () => {
    const family = resolveFamily(byId("pequod").source);
    family.modes.dark.colours.delete("syntax.comment");
    for (const id of ["vscode", "zed", "neovim"]) expect(generator(id).unavailable(family)).toContain("no complete authored syntax");
    const incomplete = resolveFamily(byId("pequod").source);
    incomplete.modes.dark.colours.delete("surfaces.editor-line");
    expect(generator("vscode").unavailable(incomplete)).toContain("needs surfaces.editor-line");
    const translucent = resolveFamily(byId("pequod").source);
    at(translucent.modes.dark, "syntax.comment").alpha = .5;
    expect(generator("neovim").unavailable(translucent)).toContain("translucent");
  });

  it("omits integrated terminal settings when that target is excluded or incomplete", () => {
    for (const excluded of [false, true]) {
      const source = structuredClone(byId("pequod").source);
      if (excluded) source.targets = { exclude: ["terminals"] };
      else delete source.modes.dark.ansi;
      const family = resolveFamily(source);
      expect(generator("vscode").unavailable(family, { mode: "dark" })).toBeUndefined();
      const vs = JSON.parse(generator("vscode").generate(family, { mode: "dark" })[0]!.content as string);
      const zed = JSON.parse(generator("zed").generate(family, { mode: "dark" })[0]!.content as string);
      expect(Object.keys(vs.colors).some((key) => key.startsWith("terminal"))).toBe(false);
      expect(Object.keys(zed.themes[0].style).some((key) => key.startsWith("terminal"))).toBe(false);
      expect(generator("neovim").generate(family, { mode: "dark" })[0]!.content).not.toContain("vim.g.terminal_color_");
    }
  });

  it("bundles both Zed modes and limits single-mode requests", () => {
    for (const family of editors) {
      expect(JSON.parse(generator("zed").generate(family)[0]!.content as string).themes.map((theme: any) => theme.appearance)).toEqual(MODES);
      expect(generator("neovim").generate(family)).toHaveLength(2);
      expect(generator("neovim").generate(family, { mode: "light" })).toHaveLength(1);
      expect(generator("vscode").generate(family)).toHaveLength(3);
      expect(generator("vscode").generate(family, { mode: "light" })).toHaveLength(2);
    }
  });

  it("registers each VS Code theme in a local extension manifest", () => {
    for (const family of editors) for (const mode of ["both", "dark", "light"] as const) {
      const files = generator("vscode").generate(family, { mode });
      const manifest = JSON.parse(files.find((file) => file.name === "package.json")!.content as string);
      expect(manifest.version).toBe(family.meta.version);
      expect(manifest.name).toBe(`ensigns-${family.meta.id}`);
      expect(manifest.license).toBe("CC-BY-4.0");
      expect(manifest.main).toBeUndefined();
      expect(manifest.contributes.themes).toHaveLength(mode === "both" ? 2 : 1);
      for (const contribution of manifest.contributes.themes) {
        const file = files.find((file) => `./${file.name}` === contribution.path);
        expect(file, contribution.path).toBeDefined();
        const theme = JSON.parse(file!.content as string);
        expect(contribution.label).toBe(theme.name);
        expect(contribution.uiTheme).toBe(theme.type === "dark" ? "vs-dark" : "vs");
      }
    }
  });
});

describe("Obsidian interface snippets", () => {
  for (const family of families) it(`${family.meta.id} uses core roles and only authored syntax`, () => {
    const css = generator("obsidian").generate(family)[0]!.content as string;
    for (const mode of MODES) {
      const body = css.match(new RegExp(`\\.theme-${mode} \\{([^}]+)\\}`))![1]!;
      expect(body).toContain(`--background-primary: ${at(family.modes[mode], "roles.bg").hex};`);
      expect(body).toContain(`--text-normal: ${at(family.modes[mode], "roles.text").hex};`);
      if (!family.source.modes[mode].syntax) expect(body).not.toContain("--code-comment:");
      else expect(body).toContain(`--code-comment: ${at(family.modes[mode], "syntax.comment").hex};`);
    }
    expect(generator("obsidian").generate(family, { mode: "light" })[0]!.content).not.toContain(".theme-dark");
  });

  it("respects a specific Obsidian exclusion", () => {
    const source = structuredClone(byId("rosebud").source);
    source.targets = { exclude: ["obsidian"] };
    expect(generator("obsidian").unavailable(resolveFamily(source))).toContain("excludes obsidian");
  });
});
