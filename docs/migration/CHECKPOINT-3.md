# Checkpoint 3: new families

Checkpoint 3 marks the completion of Phase 3 of the Ensigns migration: the design, verification and documentation of the six new colour families (Rachel, Jeroboam, Enderby, Bachelor, Delight and Townho), alongside candidate variants where genuine design trade-offs exist.

## 1. Scope of the checkpoint

Phase 3 delivers:
- Six new colour families: Rachel 0.1.0, Jeroboam 0.1.0, Enderby 0.1.0, Bachelor 0.1.0, Delight 0.1.0 and Townho 0.1.0.
- Three candidate variants: Jeroboam royal-blue, Enderby balanced and Bachelor ladder.
- Deterministic derivation scripts in scripts/design/ that reproduce all colour choices and fail on drift.
- Specimen fragments and CSS styles for each family.
- Extended test coverage in tests/families/, tests/environments/ and tests/shared/.
- Model and harness improvements: patterned set warnings in pairsApartCheck, space-separated array output in the page builder, sim-<view> documentation, and derived data declarations.
- Updated harness reports in reports/ and summary documentation in docs/migration/phase3/.

## 2. Changes

### Colour families

Rachel 0.1.0 (families/rachel/):
- Designed for older adults and readers with low vision.
- Two modes: Daylight (light) and Beacon (dark).
- Strict lightness ladder: 12.6 L* steps between status colours in both modes, ensuring readability without relying on hue.
- Text contrast exceeds 11:1 even after aged-eye simulation.
- Touch target tokens defined at 48 px minimum and 56 px comfortable.
- No data block; declares derived: ["data"].

Jeroboam 0.1.0 (families/jeroboam/):
- Designed for clinical triage, lab flags and equipment alarm priorities.
- Two modes: Standard (light) and Dark (dark).
- Five Manchester triage levels (Immediate, Very urgent, Urgent, Standard, Non-urgent) mapped to red, orange, yellow, green and blue flags, each with target times and codes.
- Portuguese triage white class included as neutral tokens (extra.triage-white-fill, -border, -fg) outside the numeric priority scale.
- HL7 lab interpretation flags (L, H, LL, HH) with directional markers and severity bindings.
- Alarm priority mapping for critical, caution and info, omitting orange.
- Candidate royal-blue (candidates/royal-blue.tokens.json) tests lighter flags at the cost of two print-reinforced pairs.
- No data block; declares derived: ["data"].

Enderby 0.1.0 (families/enderby/):
- Designed for statistical charts and scientific figures.
- Two modes: Ivory (light) and Pilot cloth (dark).
- Eight categorical series colours with high distinctness across normal vision and CVD simulations.
- Primary separable design (enderby.tokens.json) separates the first four series by 13.5 L*, passing print-grey by measurement.
- Candidate balanced design (candidates/balanced.tokens.json) compresses the eight colours into a 20 L* band to avoid visual weighting on screens, declaring all eight series patterned for print.

Bachelor 0.1.0 (families/bachelor/):
- Designed for presentation slides, posters, signage and conference banners read at 5 to 20 metres.
- Two modes: Holiday apparel (light) and Brazen lamp (dark).
- Eight saturated flag fields arranged in wheel order, paired with dedicated text inks.
- Checked against flare in lit and dark projector rooms.
- In print-grey, five flags pass by lightness separation while three carry pattern tokens.
- Candidate ladder (candidates/ladder.tokens.json) provides seven flags separated by lightness in print.

Delight 0.1.0 (families/delight/):
- Designed for channels that destroy colour: greyscale print, photocopies, e-ink displays, forced colours and monochrome terminals.
- Two modes: White ribs (light) and Sad burial (dark).
- Sixteen-level grey ramp (g0 to g15) mapping directly onto 16-level e-paper hardware.
- Text contrast reaches 21:1 for body and muted text.
- Achromatic status policy with OKLCH chroma below 0.02, using stroke weights, line styles, border patterns and icons to distinguish states.
- Photocopy safety rules preventing fills between L* 25 and 80 from thresholding to pure black or white.

Townho 0.1.0 (families/townho/):
- Designed for annotation: text highlights, track changes, manuscript diffs and grading.
- Two modes: Golden Inn daylight (light) and Golden Inn night (dark).
- Tested across all twenty ground tones of all ten families under the overlay profile.
- Translucent highlight fills maintain host text contrast (>= 8.55:1 on light grounds, >= 5.25:1 on dark grounds) and pairwise separation.
- Diff insert and delete roles pass not-red-green rules and achieve 22.2 L* (light) and 18.1 L* (dark) greyscale separation.

### Harness and tool improvements

- pairsApartCheck in lib/harness/common.ts now emits a warning check when all members of a gated distinct set are declared patterned, preventing silent empty gates.
- designLeaves in scripts/pages/tokens-css.ts formats array tokens in the design block as space-separated custom properties.
- scripts/pages/README.md documents the sim-<view> SVG filter ids used by the local page builder.
- Shared tests in tests/shared/schema.test.ts and tests/shared/candidates.test.ts assert that families and candidates without a data block declare derived: ["data"].
- Family README files cleaned of references to the brief, first-person phrasing and unverified assertions.

## 3. Test report

| Check | Result |
|---|---|
| npm test | 39 files, 584 tests, all passing in about 7 s. npm run typecheck is clean. |
| Model and schema validation | All ten families and three candidates validate against schema/family.schema.json. Families lacking data blocks declare derived: ["data"]. |
| Harness on all families | Zero errors across all listed profiles. New families pass the colour-vision target of 0.06 in OKLab with no floor and no waivers. Reports written to reports/. |
| Townho overlay validation | Tested across all 20 ground surfaces (10 families x 2 modes). Minimum text contrast is 8.55:1 on light grounds and 5.25:1 on dark grounds. Minimum ground distance is 0.062. |
| Forced colours | 25 tests in Chromium with forced colours active across all built specimens, verifying focus indicators, text selection, current navigation states and status cues. |
| Local page builder | npm run pages builds 41 preview files in preview/ without errors. |
| Stray hex | No undeclared colour literals outside palette blocks in lib/, packages/, families/, scripts/pages/ or documents. |
| Quotations | All quotations from Moby-Dick match sources/moby-dick.txt verbatim. |
| Prose tropes | Tropes checks ran clean across all new READMEs, changelog entries and specimen texts. |

## 4. What I could not do

- IEC 60601-1-8 standard text. The official standard document requires purchase and was not accessible directly. Secondary technical papers and medical device specifications were used to establish the alarm colour mappings.
- Manchester Triage reference colour definitions. Published protocols specify colour names and target response times, but provide no official Pantone, sRGB or CMYK values. The family defines its own values within recognised hue sectors.
- Portuguese triage white class national norms. Norma 002/2018 from Direção-Geral da Saúde does not codify the white category, although Portuguese hospital audits document its use for administrative demand. It is represented as neutral tokens outside the priority scale.
- Atkinson Hyperlegible Next tabular figures. Primary documentation did not confirm tabular figures for Atkinson Hyperlegible Next, so Inter and JetBrains Mono were selected for Jeroboam typography.
- Licence file downloads. The CC BY 4.0 legal code (D22) remains pending authorisation. Font files and their OFL texts are deferred to Phase 4.
- Author profile link. Verification of tiagojacinto@med.up.pt on GitHub (D2) remains pending.
- Package regeneration and deployment. Shipped packages remain at 0.2.0; build generators remain dormant until Phase 4.

## 5. Decisions I need

### New decisions for Checkpoint 3

D30. Rosebud dark-mode status accents. The dark mode of Rosebud inverts the severity order of its status accents: critical is grey.1000 on #1A1F26 (contrast 1.14:1, making it unreadable), while neutral gives 5.28:1, success gives 2.65:1 and warning gives 1.79:1. This was inherited from Ambergris. Recommendation: define a distinct dark status accent set in the next release of Rosebud.

D31. Jeroboam light-mode flag brightness. In the primary Jeroboam design, all gates pass by colour alone, but light-mode flags are dark (navy blue L* 8.4, maroon red L* 20.2). The royal-blue candidate raises blue to L* 23.3, but causes blue and red borders to print with only 0.4 L* separation, requiring print-reinforcement waivers. Visually on screen the two look almost identical. Recommendation: keep the main file and drop the royal-blue candidate.

D32. Enderby primary candidate selection. The primary separable design spaces its first four series colours by 13.5 L*, passing print-grey by physical lightness measurement with a 1.08 margin over Okabe-Ito in deutan simulation. The balanced candidate compresses all eight series into a 20 L* band, but requires all eight to be declared patterned for print and reduces deutan margin to 1.05. Recommendation: retain separable as the primary design and balanced as an optional candidate.

### Restatement of earlier open decisions

D2. Author email. Confirmation of tiagojacinto@med.up.pt on your GitHub profile so commits link properly.

D22. Licence text download. Authorisation to download the CC BY 4.0 legal text (legalcode.txt, about 20 KB) into LICENSE-CC-BY-4.0. Recommendation: approve.

D23. Pequod Ahab colour. Route E (#A82445) applied. Recommendation: keep route E.

D24. Goney Imum colour. Dedicated value (#002E73) applied. Recommendation: keep dedicated value.

D25. Colour vision target. Target of 0.06 in OKLab applied with no floors to all six new families. Existing floors on migrated families retained until their next release. Recommendation: accept.

D26. Goney keyword on current line waiver. Current line highlight waiver retained until next release retuning. Recommendation: accept.

D27. APCA dependencies. Development dependencies apca-w3 and colorparsley retained for calculation without shipping. Recommendation: retain.

D28. Rosebud mode labels. Mode labels Mid-day sea (light) and Grey amber (dark) applied. Recommendation: retain.

D29. Goney warning colour. Amber accent applied. Recommendation: retain.

## 6. Smaller points

- Added profile thresholds in tests/environments.json are annotated with explanatory comments.
- Candidate files are located in families/<id>/candidates/ and validated by tests/shared/candidates.test.ts.
- Rachel status colours sit 0.03 to 0.04 in OKLab from other families' accents because its strict 12.6 L* ladder constrains chroma.
- APCA reporting is excluded from Jeroboam reports because the apca-w3 licence prohibits clinical and human safety use.
- The local page preview is viewable by running npm run pages and inspecting preview/index.html.

## Files

- docs/migration/CHECKPOINT-3.md: this document.
- docs/migration/phase3/summary.md: harness status and tightest checks across all families and candidates.
- docs/migration/phase3/summary.json: machine-readable harness summary.
- reports/*.json: harness reports for all ten families.
- families/rachel/: Rachel family tokens, README, CHANGELOG, specimen and derivation script.
- families/jeroboam/: Jeroboam family tokens, candidates, README, CHANGELOG, specimen and derivation script.
- families/enderby/: Enderby family tokens, candidates, README, CHANGELOG, specimen and derivation script.
- families/bachelor/: Bachelor family tokens, candidates, README, CHANGELOG, specimen and derivation script.
- families/delight/: Delight family tokens, README, CHANGELOG, specimen and derivation script.
- families/townho/: Townho family tokens, README, CHANGELOG, specimen and derivation script.
- lib/harness/common.ts: patterned set check warning.
- scripts/pages/tokens-css.ts: space-separated array custom property formatting.
- scripts/pages/README.md: sim-<view> documentation.
- tests/shared/schema.test.ts and tests/shared/candidates.test.ts: derived data validation.
