import { at } from "../model/resolve.ts";
import { familyId, modesOf, provenance } from "./common.ts";
import { cssColour } from "./css-properties.ts";
import { styleFlags } from "./editor-view.ts";
import type { Generator } from "./types.ts";

export const obsidian: Generator = {
  id: "obsidian", label: "Obsidian CSS snippet",
  unavailable(family, options) {
    modesOf(options);
    return family.source.targets?.exclude?.includes("obsidian") ? "The family excludes obsidian." : undefined;
  },
  generate(family, options) {
    const modes = modesOf(options);
    if (family.source.targets?.exclude?.includes("obsidian")) throw new Error(`${family.meta.id}: The family excludes obsidian.`);
    const blocks = modes.map((mode) => {
      const colours = family.modes[mode];
      const role = (name: string) => cssColour(at(colours, `roles.${name}`));
      const values: Record<string, string> = {
        "background-primary": role("bg"), "background-primary-alt": role("surface"),
        "background-secondary": role("surface"), "background-secondary-alt": role("surface-raised"),
        "background-modifier-border": role("border"), "background-modifier-hover": role("selection"),
        "text-normal": role("text"), "text-muted": role("text-muted"), "text-faint": role("text-subtle"),
        "text-accent": role("link"), "text-accent-hover": role("link-hover"),
        "text-selection": role("selection"), "text-highlight-bg": role("selection"),
        "interactive-accent": role("button"), "interactive-accent-hover": role("button"), "text-on-accent": role("on-button"),
        "link-color": role("link"), "link-color-hover": role("link-hover"), "link-external-color": role("link"),
        "code-background": role("surface"), "code-normal": role("text"),
        "blockquote-border-color": role("accent"), "tag-color": role("link"), "tag-background": role("surface"),
        "checkbox-color": role("button"), "checkbox-marker-color": role("on-button"),
        "icon-color": role("text-muted"), "icon-color-hover": role("text"), "divider-color": role("border"),
        "scrollbar-thumb-bg": role("border"), "scrollbar-active-thumb-bg": role("text-subtle"),
      };
      if (family.source.modes[mode].syntax) {
        const syntax = (name: string) => cssColour(at(colours, `syntax.${name}`));
        Object.assign(values, {
          "code-normal": syntax("variable"), "code-comment": syntax("comment"), "code-function": syntax("function"),
          "code-important": syntax("decorator"), "code-keyword": syntax("keyword"), "code-operator": syntax("operator"),
          "code-property": syntax("variable"), "code-punctuation": syntax("punctuation"), "code-string": syntax("string"),
          "code-tag": syntax("keyword"), "code-value": syntax("number"),
        });
      }
      const prismClasses: Record<string, string> = { type: "class-name", decorator: "annotation" };
      const styles = [...colours.colours].filter(([address]) => address.startsWith("syntax.")).map(([address, colour]) => {
        const name = prismClasses[address.slice("syntax.".length)] ?? address.slice("syntax.".length);
        const flags = styleFlags(colour);
        const decoration = flags.underline ? "underline" : flags.strikethrough ? "line-through" : "none";
        return `.theme-${mode} .token.${name} { font-weight: ${flags.bold ? 700 : 400}; font-style: ${flags.italic ? "italic" : "normal"}; text-decoration: ${decoration}; }\n`;
      }).join("");
      return `.theme-${mode} {\n${Object.entries(values).map(([name, value]) => `  --${name}: ${value};`).join("\n")}\n}\n${styles}`;
    });
    const header = provenance(family).replaceAll("*/", "* /").replace(/[\r\n]/g, " ");
    const suffix = modes.length === 1 ? `-${modes[0]}` : "";
    return [{ name: `${familyId(family)}${suffix}-obsidian.css`, content: `/* ${header} */\n${blocks.join("\n")}`, mime: "text/css" }];
  },
};
