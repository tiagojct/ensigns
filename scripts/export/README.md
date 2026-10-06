# Token exports

The export builder reads the current family files, validates them and writes files into dist/exports/. It needs Node 24 and the root dependencies; it uses no vendor checkout or network request.

```bash
npm run export
npm run export -- rosebud pequod --format ghostty --mode dark
npm run export -- enderby --format css --format json --out /tmp/ensigns-exports
npm run export -- rosebud --format vscode --format zed --format neovim
npm run export -- --help
```

Without options it exports all ten families in both modes. Family names are folder ids. Repeat --format to choose several formats; --mode accepts dark, light or both. Unknown arguments and invalid tokens fail before any output is written. The builder overwrites its generated files but does not remove old files from the destination. Use an empty output folder for a filtered build if it must contain only that request.

## Formats

| Id | Output | Use |
|---|---|---|
| css | One stylesheet per family | Include the file in a document. Read roles with var(--roles-bg), var(--roles-text) and the other address properties. |
| json | Resolved palette and mode colours | Read colours by their token address; each entry retains its source, opacity and syntax style. |
| scss | Sass maps of CSS-ready strings | Import the partial and interpolate map.get values. |
| tailwind3 | CommonJS preset | Merge its theme.extend.colors into Tailwind 3. |
| tailwind4 | @theme stylesheet | Import after tailwindcss; names include family and mode. |
| dtcg | DTCG 2025.10 colour-space objects | Import into a compatible design-token tool. |
| tokens-studio | Tokens Studio sets | Enable palette and the chosen mode set. |
| quarto-brand | One YAML brand set | Rename to _brand.yml; both-mode exports select light. |
| quarto-scss | One SCSS theme per mode | Add after a base Quarto HTML theme. |
| typst | Named family dictionaries | Import the palette and choose its mode dictionary. |
| latex | xcolor definitions | Load xcolor, then input the generated file. |
| pandoc-css | One HTML stylesheet per mode | Use pandoc --standalone --css FILE. |
| ggplot2 | R scales, theme and cue metadata | source() the file; retain labels and chart cues. |
| matplotlib | Style sheets and Python module | Keep them together; call use() and register_cmaps(). |
| observable | JavaScript mode objects | Import categorical ranges or named ramps for Plot/D3. |
| wezterm | Lua colours table | Assign config.colors = dofile(PATH). |
| tmux | One configuration per mode | source-file the selected configuration. |
| iterm2 | RGB plist per mode | Import through Color Presets. |
| gpl | GIMP palette | Import opaque swatches into GIMP or Inkscape. |
| ase | Adobe Swatch Exchange and attribution | Import the binary RGB swatches; alpha entries are omitted. |
| hex | Labelled hex list | Read the opaque palette entries. |
| ghostty | One theme per mode | Copy into ~/.config/ghostty/themes/ and choose the file name with theme = rosebud-dark. |
| kitty | One .conf per mode | Save under ~/.config/kitty/ and add include rosebud-dark.conf to kitty.conf. |
| alacritty | One .toml per mode | Import the file in the general.import array in alacritty.toml. |
| windows-terminal | One colour scheme per mode | Add the JSON object to the schemes array in Windows Terminal settings, then select its name in a profile. |
| vscode | One colour-theme JSON per mode and package.json | Copy the format's entire output folder into the VS Code extensions folder, then select a contributed theme. |
| zed | One JSON file containing the requested modes | Copy into ~/.config/zed/themes/ and select a theme from the command palette. |
| neovim | One Lua colourscheme per mode | Copy into ~/.config/nvim/colors/ and use :colorscheme rosebud-dark. |
| obsidian | One CSS snippet containing the requested modes | Copy into the vault's .obsidian/snippets/ folder and enable it under Appearance, CSS snippets. |

Terminal formats require all sixteen authored ANSI slots and all six terminal roles in every requested mode. A family that excludes terminals produces no terminal files; manifest.json records the reason. A declaration that a block can be derived does not supply an authored palette.

## Editor themes

VS Code, Zed and Neovim exports are offered for Pequod, Goney, Jungfrau and Rosebud. The other six families exclude those targets. All twelve syntax roles must be authored. Bold and italic styles are preserved together; Neovim and VS Code also preserve underline and strikethrough. Zed's schema has no syntax decoration fields, so a requested mode with one of those styles is reported as unavailable.

The editor background, current line and selection use the resolved surfaces.editor, surfaces.editor-line and surfaces.editor-selection colours verbatim, including the model's compositing. These are the surfaces tested by the editor harness. A family that lists the editor environment must supply all three. Rosebud does not list that environment and has no editor surfaces; its themes use roles.bg, roles.surface and roles.selection respectively. Existing harness exceptions remain in the family report.

Diagnostics use the family's status colours, with critical, warning, neutral and success accents for achromatic status. Missing optional information, hint or conflict colours use text-muted. Integrated terminal colours are included only when a complete opaque terminal palette is authored and the terminals target is permitted. The writers apply no extra opacity to editor or terminal selections.

VS Code output includes a local extension manifest that registers the requested modes and requires VS Code 1.85 or later. For example, after building Rosebud, copy dist/exports/rosebud/vscode/ to ~/.vscode/extensions/tiagojct.ensigns-rosebud-0.5.0/, reload VS Code, and select a Rosebud theme with Preferences: Color Theme. Keep package.json beside the theme JSON files; downloading a colour-theme file alone does not register it. The manifest follows the [VS Code extension format](https://code.visualstudio.com/api/references/extension-manifest), and semantic styles follow its [semantic highlighting guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide).

The Zed JSON contains both modes by default, or only the requested one. Its structure is checked against a frozen copy of the [official schema](https://zed.dev/schema/themes/v0.2.0.json). Install it in the [local themes folder](https://zed.dev/docs/themes#local-themes). Neovim uses nvim_set_hl for standard, Tree-sitter and LSP groups; its emitted Lua is parsed independently in the test suite. Diff insertions and deletions carry underline and strikethrough cues.

Obsidian snippets are available for all ten current families. They map interface variables from the core roles, and add syntax colour variables and Prism token styles only where a syntax block is authored. They follow Obsidian's theme-dark and theme-light classes. They are interface snippets rather than complete Obsidian themes, and do not add editor or terminal palettes to families that lack them.

## CSS modes and cues

The stylesheet defaults to light mode and follows prefers-color-scheme for dark mode. Set data-mode="light" or data-mode="dark" on the document root to override it. A panel with data-family="rosebud" can select its own data-mode. With --mode light or --mode dark, the stylesheet stays in that mode.

Colour property names match the preview: roles.bg becomes --roles-bg, extra.border-strong becomes --extra-border-strong, and numbered data scales retain their order. Translucent tokens become rgb() with their original alpha. Design values become --design-<path> properties and typefaces become --font-<role>, with system fallbacks. The loose stylesheet does not download or embed font files. The public site bundles its selected faces separately.

Syntax roles also expose -font-weight, -font-style and -text-decoration properties. Achromatic status levels expose --status-<level>-weight, -edge and -icon as well as their colours. The icon property names a shape; the consuming application still draws the icon and supplies a visible label. The stylesheet defines tokens, without applying an interface reset or component rules.

The JSON format is ensigns-resolved-v1. Colours and palette entries are resolved; design and status declarations retain their original references and non-colour cues. Palette references in those declarations address the accompanying palette, and design references address the accompanying design object. Optional blocks are not invented. A dataRef, if present, records a dependency on another family rather than copying its colours.

## Provenance and verification

manifest.json lists the source token path and SHA-256 hash for each family, and the path, media type and SHA-256 hash of each exported file. It includes family versions and unavailable-format reasons. The manifest records the family and source for Windows Terminal schemes, whose JSON contains only scheme settings. The other formats carry an Ensigns attribution line. Tokens remain under CC BY 4.0; code remains under MIT, as the root LICENSE states.

The library in lib/generators/ is pure TypeScript. ExportFile.content is string or Uint8Array; the latter is used for Adobe ASE. The CLI and the preview use the same writers; the public Carpenter imports them directly. The tests cover output provenance, complete colour and style retention, ANSI ordering, unsupported targets, editor surface fidelity, Zed schema validation, Lua parsing, VS Code manifest references, browser mode selection, deterministic hashes and argument validation. The Lua parser and Zed schema fixture are test-only dependencies.

The local preview also writes exports/ beside the pages and links downloads from each family's facts. Candidate downloads have separate folders under exports/<family>--<candidate>/.

## Charts and opaque formats

Chart exports require authored data. A declaration that data can be derived produces an unavailable reason until an authored palette is supplied. All named sequential and diverging ramps are retained, and plot surfaces accept the vocabulary used by each family. Sequential-only families do not acquire an invented categorical cycle. The chart payload includes design and distinct-set declarations; consuming figures still need labels and the declared marker or pattern cues.

DTCG exports follow the [2025.10 colour type](https://www.designtokens.org/tr/2025.10/format/#color). Tokens Studio uses CSS colour strings. Both retain opacity and source descriptions, and include the original typography, design and status declarations as extension metadata. Those declarations reference the accompanying palette and design; colour token values themselves are resolved.

Typst and LaTeX include opaque resolved colours. GIMP, Adobe ASE and hex lists include opaque palette entries. Translucent colours remain available in the CSS and JSON/design-token formats. Adobe files include a separate attribution text.

[Release instructions](../../docs/RELEASE.md) describe all local package bundles and owner publication.
