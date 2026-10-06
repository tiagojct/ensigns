import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { GENERATORS, generateAll } from "../../lib/generators/index.ts";
import { scopeProperties } from "../../lib/generators/css-properties.ts";
import { loadFamilies, repoRoot } from "../../lib/model/load.ts";
import { at, resolveFamily } from "../../lib/model/resolve.ts";
import { ANSI_SLOTS, MODES } from "../../lib/model/types.ts";
import { buildExports } from "../../scripts/export/generate.ts";

const families = loadFamilies().map((loaded) => resolveFamily(loaded.file));
const byId = (id: string) => families.find((family) => family.meta.id === id)!;
const generator = (id: string) => GENERATORS.find((entry) => entry.id === id)!;
const work = mkdtempSync(join(tmpdir(), "ensigns-exports-"));
afterAll(() => rmSync(work, { recursive: true, force: true }));

describe("current token exports", () => {
  for (const family of families) {
    it(`${family.meta.id} generates deterministic, attributed files with no unresolved colours`, () => {
      const results = generateAll(family);
      expect(generateAll(family)).toEqual(results);
      expect(results.map((result) => result.generator.id)).toEqual(GENERATORS.map((entry) => entry.id));
      for (const { generator: format, files, reason } of results) {
        if (reason) { expect(files).toEqual([]); continue; }
        expect(files.length).toBeGreaterThan(0);
        for (const file of files) {
          if (typeof file.content === "string") expect(file.content).not.toMatch(/undefined|\[object Object\]/);
          if (format.id === "vscode" && file.name === "package.json") expect(JSON.parse(file.content as string).name).toBe(`ensigns-${family.meta.id}`);
          else if (format.id !== "tailwind3" && format.id !== "scss") expect(file.name).toMatch(new RegExp(`^${family.meta.id}`));
          if (typeof file.content === "string" && format.id !== "windows-terminal") expect(file.content).toContain("Tokens CC BY 4.0");
          if (!["json", "dtcg", "tokens-studio", "observable", "ggplot2", "matplotlib"].includes(format.id)) expect(file.content).not.toContain("{palette.");
        }
      }
    });
  }

  it("retains every resolved colour, opacity, origin, style and status cue in JSON", () => {
    for (const family of families) {
      const output = JSON.parse(generator("json").generate(family)[0]!.content as string);
      expect(output.meta).toEqual(family.meta);
      expect(output.palette).toEqual(Object.fromEntries(family.palette));
      expect(output.design).toEqual(family.source.design ?? {});
      for (const mode of MODES) {
        expect(output.modes[mode].colours).toEqual(Object.fromEntries(family.modes[mode].colours));
        expect(output.modes[mode].status).toEqual(family.source.modes[mode].status);
      }
    }
    const townho = JSON.parse(generator("json").generate(byId("townho"))[0]!.content as string);
    expect(Object.values(townho.modes.dark.colours).some((colour: any) => colour.alpha > 0 && colour.alpha < 1)).toBe(true);
  });

  it("exports styles and border cues as CSS properties without flattening translucent overlays", () => {
    const rosebud = byId("rosebud");
    const props = new Map(scopeProperties(rosebud, "dark"));
    expect(props.get("--syntax-keyword-font-weight")).toBe("700");
    expect(props.get("--syntax-comment-font-style")).toBe("italic");
    expect(props.get("--status-warning-edge")).toBe("dashed");
    expect(props.get("--status-critical-weight")).toBe("var(--design-border-width-thick)");
    const overlay = byId("townho");
    for (const [address, colour] of overlay.modes.dark.colours) {
      if (colour.alpha !== undefined) {
        expect(new Map(scopeProperties(overlay, "dark")).get(`--${address.replaceAll(".", "-")}`)).toContain(` / ${colour.alpha})`);
      }
    }
  });

  it("preserves ANSI slot order and terminal chrome in each format and mode", () => {
    for (const family of families.filter((f) => !generator("ghostty").unavailable(f))) {
      for (const mode of MODES) {
        const colours = family.modes[mode];
        const windows = JSON.parse(generator("windows-terminal").generate(family, { mode })[0]!.content as string);
        expect(windows.background).toBe(at(colours, "terminal.background").hex);
        expect(windows.foreground).toBe(at(colours, "terminal.foreground").hex);
        expect(windows.cursorColor).toBe(at(colours, "terminal.cursor").hex);
        expect(windows.selectionBackground).toBe(at(colours, "terminal.selection-background").hex);
        const names = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"];
        ANSI_SLOTS.forEach((slot, i) => {
          const name = i < 8 ? names[i]! : `bright${names[i - 8]![0]!.toUpperCase()}${names[i - 8]!.slice(1)}`;
          expect(windows[name], `${family.meta.id} ${mode} ${slot}`).toBe(at(colours, `ansi.${slot}`).hex);
        });
        const ghostty = generator("ghostty").generate(family, { mode })[0]!.content as string;
        const kitty = generator("kitty").generate(family, { mode })[0]!.content as string;
        const toml = generator("alacritty").generate(family, { mode })[0]!.content as string;
        expect(ghostty.match(/^palette = /gm)?.length).toBe(16);
        expect(kitty.match(/^color\d+ /gm)?.length).toBe(16);
        expect(toml.match(/^\[colors\./gm)?.length).toBe(5);
        ANSI_SLOTS.forEach((slot, i) => {
          const hex = at(colours, `ansi.${slot}`).hex;
          expect(ghostty).toContain(`palette = ${i}=${hex}\n`);
          expect(kitty).toContain(`color${i} ${hex}\n`);
        });
      }
    }
  });

  it("reports unavailable targets and refuses to invent terminal colours", () => {
    for (const id of ["enderby", "bachelor", "rachel", "jeroboam", "townho"]) {
      const terminal = generateAll(byId(id)).filter((result) => ["ghostty", "kitty", "alacritty", "windows-terminal"].includes(result.generator.id));
      for (const result of terminal) {
        expect(result.reason).toBe("The family excludes terminal themes.");
        expect(result.files).toEqual([]);
        expect(() => result.generator.generate(byId(id))).toThrow("excludes");
      }
    }
    const incomplete = structuredClone(byId("pequod").source);
    delete incomplete.modes.dark.ansi;
    expect(generator("ghostty").unavailable(resolveFamily(incomplete))).toContain("no complete authored");
    const translucent = resolveFamily(byId("pequod").source);
    at(translucent.modes.dark, "ansi.red").alpha = .5;
    expect(generator("ghostty").unavailable(translucent)).toContain("translucent");
  });

  it("limits single-mode requests and rejects invalid runtime options", () => {
    for (const mode of MODES) {
      const output = JSON.parse(generator("json").generate(byId("pequod"), { mode })[0]!.content as string);
      expect(Object.keys(output.modes)).toEqual([mode]);
      expect(generator("ghostty").generate(byId("pequod"), { mode })).toHaveLength(1);
    }
    expect(() => generateAll(byId("pequod"), { mode: "nocturnal" as any })).toThrow("Unknown mode");
  });
});

describe("export build and CLI", () => {
  it("writes verifiable source and output hashes and identical manifests on a second build", () => {
    const out = join(work, "complete");
    const written = buildExports(repoRoot(), out);
    const original = readFileSync(join(out, "manifest.json"), "utf8");
    const manifest = JSON.parse(original);
    expect(manifest.families).toHaveLength(10);
    for (const family of manifest.families) {
      expect(family.source.sha256).toBe(createHash("sha256").update(readFileSync(join(repoRoot(), family.source.file))).digest("hex"));
      for (const format of family.formats) for (const file of format.files) {
        expect(written).toContain(file.path);
        expect(file.sha256).toBe(createHash("sha256").update(readFileSync(join(out, file.path))).digest("hex"));
      }
    }
    expect(buildExports(repoRoot(), out)).toEqual(written);
    expect(readFileSync(join(out, "manifest.json"), "utf8")).toBe(original);
  });

  it("filters family, format and mode via the CLI", () => {
    const out = join(work, "selected");
    execFileSync(process.execPath, ["scripts/export/build.ts", "rosebud", "--format", "ghostty", "--mode", "dark", "--out", out], { cwd: repoRoot() });
    const manifest = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"));
    expect(manifest.mode).toBe("dark");
    expect(manifest.families.map((family: any) => family.id)).toEqual(["rosebud"]);
    expect(manifest.families[0].formats.map((format: any) => format.id)).toEqual(["ghostty"]);
    expect(manifest.families[0].formats[0].files.map((file: any) => file.path)).toEqual(["rosebud/ghostty/rosebud-dark"]);
  });

  it("fails on unknown requests and invalid tokens before writing anything", () => {
    for (const args of [["missing"], ["--format", "missing"], ["--mode", "missing"], ["--unknown"], ["--format"]]) {
      const out = join(work, "invalid");
      const result = spawnSync(process.execPath, ["scripts/export/build.ts", "--out", out, ...args], { cwd: repoRoot(), encoding: "utf8" });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/Unknown|needs a value/);
      expect(existsSync(out)).toBe(false);
    }
    const root = join(work, "bad-root");
    cpSync(join(repoRoot(), "families"), join(root, "families"), { recursive: true });
    cpSync(join(repoRoot(), "schema"), join(root, "schema"), { recursive: true });
    writeFileSync(join(root, "families/rosebud/rosebud.tokens.json"), "{}");
    const out = join(work, "bad-output");
    expect(() => buildExports(root, out)).toThrow("invalid tokens");
    expect(existsSync(out)).toBe(false);
  });
});
