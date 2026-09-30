# Changelog

## 0.1.0 (2026-09-30)

First release. Jeroboam is the clinical status family, after the ship of chapter 71, The Jeroboam's Story. The token file is `families/jeroboam/jeroboam.tokens.json`, in the Ensigns schema (`schema/family.schema.json`). The design is recorded in `scripts/design/jeroboam.ts`.

Added:

- Two modes, Dark and Light, with no secondary labels. The ground is a warm neutral of hue 72 and chroma 0.006 to 0.009 (palette group `walnut`, 20 steps named by lightness). The link and the accent are a slate ink (group `slate`, four steps).
- Five flag groups, `blue`, `green`, `yellow`, `orange` and `red`, each with a border, a fill and a foreground for each mode. Every flag border sits inside the hue region where its Manchester name is read.
- An ordered severity scale (information, caution, critical) and the five Manchester levels, as `design.clinical.levels` and `design.clinical.triage`. Each level has a foreground, a fill, a border, an icon token and a word. The severity levels reuse the triage colours: info is the blue, caution the yellow, critical the red. `status` is chromatic, with `danger` the critical red.
- Extra roles for a success colour, for a neutral White class that the Grupo Português de Triagem added to the Portuguese use of the Manchester system, for control outlines and for alternate table rows.
- Design tokens for the protocol number and target time of each triage level, for the alarm priorities (high is critical, medium is caution, low is info), for the four lab flags (L, H, LL and HH with arrow icons), and for type, border and focus.
- 30 declared pairs. Every text pair holds 7:1 in both modes, because print-grey holds text to 7:1 after conversion to grey.
- Five distinct sets: `flags` (every status and triage border, colour vision), `severity`, `triage-dark` and `triage-light` (greyscale, 12 L*), and `link-and-accent` (colour vision). No set has a floor or a reinforced pair.
- Eight rules, three with automatic checks: `hover-direction`, `accent-only-in-roles` and `lightness-gap`.
- Inter for sans and JetBrains Mono for mono, both under the SIL Open Font License. Nothing is downloaded in this release.
- A specimen: a triage queue, a lab results table with flags, decision support alert cards in an active and a dismissed state, a row of vital signs, and a legend of levels and alarm priorities. All data is invented.
- A second candidate, `candidates/royal-blue.tokens.json`, which trades two print pairs in the light mode for a royal blue.
- The README with the research on the Manchester colours, the Portuguese white class, IEC 60601-1-8, laboratory flags and fonts, each with its sources and what could not be verified.
- `tests/families/jeroboam.test.ts`, 14 cases that lock the levels and their order, the protocol numbers, the hue regions, the neutral chrome, the declarations that stand in for floors, and what the candidate reinforces.

The four listed profiles, office-screen, clinical, cvd and print-grey, pass with no error and no waiver in the main file and in the candidate.
