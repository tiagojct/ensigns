import type { ModeName, ResolvedFamily } from "../model/types.ts";
import { scopeProperties } from "./css-properties.ts";
import { familyId, json, modesOf, provenance } from "./common.ts";
import type { Generator } from "./types.ts";

const block = (family: ResolvedFamily, mode: ModeName, selector: string): string =>
  `${selector} {\n  color-scheme: ${mode};\n${scopeProperties(family, mode).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;

export const css: Generator = {
  id: "css", label: "CSS custom properties", unavailable: () => undefined,
  generate(family, options) {
    const id = familyId(family);
    const modes = modesOf(options);
    const scope = `[data-family="${id}"]`;
    const header = provenance(family).replaceAll("*/", "* /").replace(/[\r\n]/g, " ");
    let content = `/* ${header} */\n`;
    if (modes.length === 1) {
      content += block(family, modes[0]!, `:root, ${scope}`);
    } else {
      content += block(family, "light", `:root, ${scope}`);
      content += `@media (prefers-color-scheme: dark) {\n${block(family, "dark", `:root:not([data-mode="light"]), ${scope}:not([data-mode="light"])`)}}\n`;
      content += block(family, "dark", `:root[data-mode="dark"], ${scope}[data-mode="dark"]`);
      content += block(family, "light", `:root[data-mode="light"], ${scope}[data-mode="light"]`);
    }
    const suffix = modes.length === 1 ? `-${modes[0]}` : "";
    return [{ name: `${id}${suffix}.css`, content, mime: "text/css" }];
  },
};

export const resolvedJson: Generator = {
  id: "json", label: "Resolved tokens (JSON)", unavailable: () => undefined,
  generate(family, options) {
    const modes = modesOf(options);
    const content = json({
      format: "ensigns-resolved-v1",
      attribution: provenance(family),
      meta: family.meta,
      palette: Object.fromEntries(family.palette),
      typography: family.source.typography ?? {},
      design: family.source.design ?? {},
      derived: family.source.derived ?? [],
      targets: family.source.targets ?? {},
      modes: Object.fromEntries(modes.map((mode) => [mode, {
        label: family.modes[mode].label ?? mode,
        colours: Object.fromEntries(family.modes[mode].colours),
        // Keep the non-colour cues: resolving only hex values loses severity.
        status: family.source.modes[mode].status,
        dataRef: family.modes[mode].dataRef,
      }])),
    });
    const suffix = modes.length === 1 ? `-${modes[0]}` : "";
    return [{ name: `${familyId(family)}${suffix}.json`, content, mime: "application/json" }];
  },
};
