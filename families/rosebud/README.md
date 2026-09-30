# Rosebud

Rosebud is a near-monochrome interface system on a cool grey ramp, with one teal accent for interaction and a five-step hue sweep for data. The token file states the goal: quiet application chrome for tools used for hours, such as dashboards, admin tools, the chrome of editors and the interface of Loomings.

Version 0.4.0. Until 0.3.0 the family was called Ambergris. The tokens are in [rosebud.tokens.json](rosebud.tokens.json) and the history is in [CHANGELOG.md](CHANGELOG.md).

## Environments

Three test profiles are listed in the token file. Their thresholds are in `tests/environments.json`, and `node scripts/report.ts rosebud` writes the current results to `reports/rosebud.json`.

- office-screen: a reader at a desk on an ordinary monitor. Every declared pair meets its WCAG 2.x minimum in each mode it names, 4.5:1 for text and 3:1 for large text and components. AAA and APCA are reported and never gated.
- cvd: the declared distinct set, the six ANSI hue slots, keeps its members apart under normal vision and under protan, deutan and tritan simulation. The measurements are in the section on colour vision below.
- forced-colors: forced-colours modes such as Windows High Contrast replace every colour, so focus, selection, the current item and status must each keep a marker that is not colour alone. This profile renders a specimen page in a browser and does not read the tokens.

## The four rules

The rules are copied from the token file. Each one names a check in `lib/model/checks.ts`, and every check holds in both modes. The check for rule 4 covers the dark and the light functional hues (palette groups ansi-dark and ansi-light).

1. Accent marks interaction only: links, current item, selection, accent rules. Never severity, never decoration.
2. Status is achromatic. Severity is carried by border weight, edge style and fill density, plus an icon and explicit copy.
3. The data sweep never appears in interface chrome, and the interface accent never appears in a chart.
4. Functional hues exist for terminal and editor content only: ANSI slots, diffs, diagnostics. Never interface chrome.

## Decisions

### Role names

Every Ensigns family has the same fifteen core roles. The Ambergris roles map onto them as below, and no role changed colour in the move.

| Ambergris | Rosebud |
|---|---|
| surface | bg |
| surface-sunken | surface |
| text-primary | text |
| text-secondary | text-muted |
| text-tertiary | text-subtle |
| rule | border |
| accent-line | accent |
| fill-solid | button |
| text-on-fill | on-button |
| focus-ring | focus |
| accent-surface | selection |
| border | extra.border-control |

The roles surface-raised, link and link-hover keep their names. The other Ambergris roles keep theirs under `extra`, from ground to focus-halo. Ambergris had no on-accent role; Rosebud sets it to grey.950 in both modes, the value the old site used.

### Light ports (D3)

Ambergris shipped dark ports only, for Ghostty, Zed, Firefox and Mastodon. The old site filled in the light terminal by reusing the dark ANSI slots, and the light syntax by a contrast mirror of the dark greys. On the light ground the twelve reused hue slots measured 1.5:1 to 2.9:1, white 1.6:1, and bright white was the background colour itself. Decision D3 builds the light Ghostty and Zed ports from the rules of the main branch: syntax stays achromatic, and the functional hues are retuned for light grounds. Generators write the port files from the tokens in a later phase.

All the gates below are on the light terminal background, grey.000.

- Red, green, yellow, blue and magenta keep the hue angle and the chroma of their dark slot (palette group ansi-dark). Chroma stays at or under 0.10, near the accent, so a screen full of colour still reads as near-monochrome. The lightness goes down until the colour clears 4.5:1. Each bright slot keeps its own dark hue and chroma and sits above its normal slot by the lightness step it has in the dark set, 0.06 to 0.07 in OKLab, which puts it at 3.4:1 to 3.5:1. These ten colours are the new palette group ansi-light.
- Cyan is the accent. Cyan takes accent.700 and bright cyan takes accent.600, the lightest pair of adjacent accent steps that clears 4.5:1 and 3:1 with a bright step between 0.04 and 0.08. The lighter pair, accent.600 and accent.500, steps by 0.095 and would leave cyan 0.0599 from green, under the 0.06 distance gate.
- The greys come from the grey ramp. Black stays grey.950, the step the dark set uses, which is also the light terminal foreground. White becomes grey.700, a mid grey and the lightest step that clears 4.5:1: programs that print white text assume a dark background, and a mid grey keeps that text readable. Bright white becomes grey.500, the lightest step that clears 3:1. Bright black moves from grey.700 to grey.600, between the two, so dim text such as shell autosuggestions stays lighter than the foreground and the four greys stay distinct. The price is white text on a black block, as some status bars draw it, which falls from 10.18:1 in dark to 2.65:1 in light.

| Slot | Old entry | New entry | Old contrast | New contrast |
|---|---|---|---|---|
| black | grey.950 | grey.950 | 16.00 | 16.00 |
| red | ansi-dark.red | ansi-light.red | 2.91 | 4.55 |
| green | ansi-dark.green | ansi-light.green | 2.30 | 4.51 |
| yellow | ansi-dark.yellow | ansi-light.yellow | 1.80 | 4.51 |
| blue | ansi-dark.blue | ansi-light.blue | 2.49 | 4.51 |
| magenta | ansi-dark.magenta | ansi-light.magenta | 2.48 | 4.51 |
| cyan | accent.400 | accent.700 | 2.31 | 6.32 |
| white | grey.300 | grey.700 | 1.57 | 6.03 |
| bright-black | grey.700 | grey.600 | 6.03 | 4.36 |
| bright-red | ansi-dark.bright-red | ansi-light.bright-red | 2.23 | 3.40 |
| bright-green | ansi-dark.bright-green | ansi-light.bright-green | 1.81 | 3.40 |
| bright-yellow | ansi-dark.bright-yellow | ansi-light.bright-yellow | 1.48 | 3.55 |
| bright-blue | ansi-dark.bright-blue | ansi-light.bright-blue | 1.92 | 3.36 |
| bright-magenta | ansi-dark.bright-magenta | ansi-light.bright-magenta | 1.93 | 3.39 |
| bright-cyan | accent.300 | accent.600 | 1.75 | 4.58 |
| bright-white | grey.000 | grey.500 | 1.00 | 3.03 |

The token file declares a pair for each light slot on the terminal background: text (4.5:1) for the normal slots, and large (3:1) for the bright slots, which are emphasis colours.

The light syntax was checked and kept. Every role clears 4.5:1 on the light background, from 6.03:1 for comments and punctuation to 18.30:1 for functions. Styles match the dark port: keywords bold, strings and comments italic. The order of prominence is the dark order, with one tie that the ramp forces: only five grey steps clear 4.5:1 on the light ground, and the dark syntax uses six levels. The mirror merges the two closest dark levels, grey.100 for variables and parameters and grey.200 for keywords, numbers, types and constants (0.042 apart in OKLab lightness), into grey.950. Keywords stay apart by weight.

The light terminal chrome was checked and kept. The foreground is 16.00:1 on the background, the cursor text 18.30:1 on the cursor and the selection text 12.48:1 on the selection. The selection is alpha-accent.24 drawn over the terminal background, the same rule the dark port uses over grey.1000.

[scripts/design/rosebud-light.ts](../../scripts/design/rosebud-light.ts) is the record of the method. It derives the values, stops if the token file differs from them or a check fails, prints these tables and writes the list of changed values to `tests/shared/expected-changes/rosebud.json`.

## Chapters 91 and 92

The Pequod Meets the Rose-Bud, and Ambergris. The Pequod finds a French whaler, the Bouton de Rose, with two dead whales alongside. Stubb tricks her captain into casting off both whales, then tows away the dried one and digs ambergris out of it. The quote in the token file is from chapter 91: "the romantic name of this aromatic ship". Chapter 92 describes the substance that gave the family its old name.

## Modes

Rosebud has two modes, Dark and Light, and no secondary labels yet.

Proposal, not adopted: one label from each chapter.

- Light (Mid-day sea), from the first paragraph of chapter 91: "a sleepy, vapory, mid-day sea".
- Dark (Grey amber), from chapter 92, where ambergris is "the French compound for grey amber".

Both quotations are also in `meta.quotes` in the token file, where the quotes test checks them against `sources/moby-dick.txt`.

## Colour vision

Measured with lib/colour. Each colour goes through the Machado, Oliveira and Fernandes (2009) matrices at severity 1.0 in linear light (`simulateCvd`), and the pairs are compared by OKLab distance (`oklabDistance`). The set is ansi-hues, the six ANSI hue slots. Each cell gives the smallest pairwise distance and the pair that has it.

| Mode | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|
| Dark | 0.061, green and cyan | 0.023, blue and magenta | 0.033, blue and magenta | 0.028, blue and cyan |
| Light | 0.089, green and yellow | 0.027, blue and magenta | 0.026, red and green | 0.037, green and blue |

Terminals give no way to reinforce a hue with weight or slant, so the protan, deutan and tritan results are reported as warnings, and the normal-vision distance of 0.06 is the gate. Both modes pass the gate, and both fall below 0.06 under every simulation. A reader with a colour vision deficiency cannot rely on these hues alone: in the light mode, red and green are 0.026 apart under deutan simulation.

## Licences

The original repository carried no licence. Decision D4 gives Rosebud the licences of the other families, as the root [LICENSE](../../LICENSE) states them:

- code: MIT, see [LICENSE-MIT](../../LICENSE-MIT);
- colour tokens and documentation, including the token file, this README and the changelog: CC BY 4.0, see [LICENSE-CC-BY-4.0](../../LICENSE-CC-BY-4.0).

The Mastodon port vendors the Tangerine Neue template by Niléane Dorffer, under the MIT licence. Its licence text is `packages/mastodon/vendor/TANGERINE-LICENSE`.
