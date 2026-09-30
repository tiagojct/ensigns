# Jeroboam

Jeroboam is the clinical status family of Ensigns. The ground is a neutral with a faint warm cast, and colour appears only where a status is meant. This is version 0.1.0. The colours are in `jeroboam.tokens.json` in this folder, which follows `schema/family.schema.json`, and the history is in [CHANGELOG.md](CHANGELOG.md). [scripts/design/jeroboam.ts](../../scripts/design/jeroboam.ts) records how every value was chosen. It derives the palette in OKLCH, compares it with the token file, runs the four profiles and stops on any difference or failure.

## Goal

Clinical status for professionals: CDSS alerts, lab flags (low, high, critical), Manchester triage, alarm priorities, and the teaching prototypes and the Doubloon game that show them.

The family holds an ordered severity scale (information, caution, critical), the five Manchester levels, a green for a normal or confirmed state, and the neutrals that carry everything else. Every level has its own icon and its own word, and every triage level also has its protocol number, so colour never stands alone.

## The ship

Chapter 71, The Jeroboam's Story. The Jeroboam of Nantucket answers the Pequod's signal, but her captain will not come aboard: "the Jeroboam had a malignant epidemic on board". Mayhew keeps his boat a few yards off and talks across the water, in what Melville calls "the timid quarantine of the land".

Gabriel, the prophet of the Jeroboam's crew, warns the Pequod: "Think, think of the fevers, yellow and bilious!" Yellow is the caution colour here. He wears a coat of "a faded walnut tinge", and the ground takes that tinge as a hue of 72 degrees at OKLCH chroma 0.006 to 0.009. Every whale-ship has a private signal, collected in a book that each captain carries, so that captains can "recognise each other upon the ocean". A triage colour is a code of that kind: agreed in advance and read at a glance.

## Environments

The token file lists four environments in `meta.environments`. Each threshold and its reason is in `tests/environments.json`, and the checks are in `lib/harness`. `node scripts/report.ts jeroboam` writes every check with its measured value to `reports/jeroboam.json`. All four profiles pass with no error and no waiver.

- office-screen: the 30 declared pairs meet WCAG 2.x AA in both modes. Twenty-five are text pairs (4.5:1 needed) and five are components (3:1). AAA is reported and APCA is reported by the harness for this profile; neither gates.
- clinical: two ordered lists, the severity levels (information, caution, critical) and the triage levels (blue, green, yellow, orange, red, least urgent first). Adjacent borders are at least 8 L* apart and at least 0.06 apart in OKLab under normal vision and each simulation. Each foreground holds 4.5:1 on its fill and each border 3:1 on the page. Every icon and every word is unique inside its list. No colour outside the status tokens comes within 0.10 of the critical red.
- cvd: five declared sets (below) with no floor and no reinforced pair. Every pair stays 0.06 apart under normal vision and under protan, deutan and tritan simulation (Machado, Oliveira and Fernandes 2009, severity 1.0).
- print-grey: the declared text pairs hold 7:1 after conversion to grey, and the severity and triage sets hold 12 L* between members.

Because print-grey holds text to 7:1, every declared text pair in the file holds 7:1, not only 4.5:1. The tightest is subtle text on the page, at 7.34:1 in the light mode.

## Modes

Jeroboam has two modes, Dark and Light, and no secondary labels: chapter 71 offers no natural name for either. Dark is for dark surroundings, such as a ward at night or a control room. Light is for lit ones.

| Mode | Ground | Card | Raised card | Text | Text on ground |
|---|---|---|---|---|---|
| dark | `walnut.l8` #1A1713 | `walnut.l11` | `walnut.l15` | `walnut.l94` #F1EDEA | 15.34:1 |
| light | `walnut.l96` #F6F3F0 | `walnut.l98` | `walnut.l100` #FFFFFF | `walnut.l10` #1E1B17 | 15.52:1 |

In the light mode the page is the darkest of the grounds, so a border that holds 3:1 on the page holds at least 3:1 on a card. The two modes are separate designs. In the light mode a flag is a dark border on a pale tint with dark text. In the dark mode it is a bright border on a dark tint with pale text.

## Structure

- Palette groups: `walnut` (the ground, the inks and the hairlines, 20 steps named by their lightness, such as l96), `slate` (the link and the accent, four steps) and one group for each flag colour: `blue`, `green`, `yellow`, `orange` and `red`. Each flag group holds a border, a fill and a foreground for each mode, for example `red.light-border`.
- Core roles: the 15 of every family. The link and the accent are a slate ink. The button is the text colour in the light mode and a pale ink in the dark mode. Focus is the text colour in the light mode and the lightest ink in the dark mode, drawn as a 2px outline with a 2px offset.
- Extra roles (32): `info-`, `caution-` and `critical-` with `-fg`, `-fill` and `-border`; the same three for `success-`; the same three for each of `triage-blue`, `triage-green`, `triage-yellow`, `triage-orange` and `triage-red`; a neutral `triage-white-` set; `border-strong` for control outlines; and `row-alt` for alternate table rows.
- Status: chromatic. `danger` is the critical border, `warning` the caution border, `success` the green and `info` the blue.
- Design tokens: `design.clinical` (the two lists read by the clinical profile), `design.triage` (the protocol number and target time in minutes of each level), `design.alarm` (high is critical, medium is caution, low is info), `design.lab` (the letter, icon and level of each lab flag), and type, border and focus tokens.
- No data block, no syntax, no ANSI and no terminal block. The family leaves out the `vscode`, `zed`, `neovim` and `terminals` bundles.

The levels and their icon tokens:

| Level | Colour | Icon token | Word |
|---|---|---|---|
| info | blue | `circle-info` | Information |
| caution | yellow | `triangle-exclamation` | Caution |
| critical | red | `octagon-exclamation` | Critical |
| triage 5 | blue | `number-5` | Non-urgent |
| triage 4 | green | `number-4` | Standard |
| triage 3 | yellow | `number-3` | Urgent |
| triage 2 | orange | `number-2` | Very urgent |
| triage 1 | red | `number-1` | Immediate |

The severity levels reuse the triage colours on purpose: info is the triage blue, caution the triage yellow and critical the triage red, and `success` is the triage green. There are 54 palette entries and 51 addresses in each mode. No artwork is shipped; the icon tokens are names for the generators, and the specimen draws its own simple icons.

The specimen is `specimen/specimen.html` with `specimen/specimen.css`. `npm run pages` builds it into `preview/jeroboam.html`, once for each mode, with the simulation views and with the candidate beside it. It holds a triage queue, a lab results table with flags, three decision support alerts (two active, one dismissed), a row of vital signs and a legend of levels and alarm priorities. All data is invented and no quotation is used.

Generators come in phase 4 and nothing in this release builds them. The intended targets are CSS, Tailwind, DTCG, Tokens Studio, Quarto callouts, and R and Python status scales. Quarto has five callout types against three severity levels and a success colour: note can take info, tip success, warning caution and important critical, and the generator has to decide the fifth.

## Rules

Eight rules are stated in the token file.

- `red-reserved`: red is reserved for critical and immediate. The clinical profile measures every colour of both modes outside the status tokens against the critical border. The nearest is 0.144 in the light mode (the accent) and 0.197 in the dark mode (the control outline), against 0.10 needed.
- `colour-means-status`: chroma belongs to status and triage. Every core role has OKLCH chroma under 0.04; the highest is the accent at 0.026 in the light mode and 0.025 in the dark mode. The family's test checks it.
- `never-colour-alone`: every level has its own icon and its own word, and every triage level its number. The clinical profile checks that icons and words are unique inside each list.
- `links-underlined`: links are underlined, because their colour is an ink and not a hue. The hover darkens the link in the light mode and lightens it in the dark mode. The check `hover-direction` runs.
- `accent-is-a-marker`: the accent is a quiet marker and never a fill. The check `accent-only-in-roles` allows no other role the accent's colour.
- `red-and-green-by-lightness`: the critical and standard borders differ by at least 12 L* in both modes, so red and green are never told apart by hue alone. The check `lightness-gap` runs. The measured gap is 12.3 L* in the light mode and 26.9 L* in the dark mode.
- `orange-is-triage`: orange belongs to the triage scale. Alarm priorities use critical, caution and info. No automatic check.
- `no-conformance-claim`: the family is a colour and type system. It does not validate a triage algorithm, a decision rule or an alarm design, and nothing here claims conformance with a protocol or with IEC 60601-1-8. No automatic check: the rule binds the prose in this folder and on the site.

## What the protocols say

The brief asked five questions. The answers below rest on the pages and documents that were read, and they say what could not be checked. None of this is clinical advice.

### Manchester: colours, names and times

The five categories each have a number, a name, a colour and a target time to first medical assessment: 1 Immediate (red, 0 minutes), 2 Very urgent (orange, 10), 3 Urgent (yellow, 60), 4 Standard (green, 120), 5 Non-urgent (blue, 240). In Portuguese: emergente, muito urgente, urgente, pouco urgente, não urgente. Amthauer and Cunha (2016) give the English names, and DGS Norma 002/2018 gives the Portuguese ones and the same times.

How the colour is defined: every source read names the colour and gives no reference value, no Pantone, sRGB or CMYK. The manual of the Manchester Triage Group itself was not seen, so it is not known whether it gives one. The family therefore chooses its own value for each named colour, inside the hue region where the name is read: red 20 to 40 degrees of OKLCH hue, orange 50 to 75, yellow 95 to 115, green 135 to 160, blue 240 to 265. Every flag in both modes sits inside its region.

A colour does not say which scale it belongs to. The same norm lists the Canadian Paediatric Triage and Acuity Scale, which also runs red, orange, yellow, green and blue, with target times of 0, 15, 30, 60 and 120 minutes. The number, the word and the target time carry the scale, which is one more reason the rows show all of them.

### Portugal and the white class

Yes: Portuguese emergency departments also use white. The Grupo Português de Triagem (GPT) represents the authors of the system in Portugal. The Manchester system reached Portugal on 15 October 2000, from the English edition of 1997, and the GPT's own document says so. The dissertation of António Marques da Silva (2009), which the GPT hosts, says the GPT introduced the white class in 2000 and revised it in 2009, as an adaptation made with the knowledge and authorisation of the original authors. It puts white at about 5 to 10 per cent of patients in Portuguese emergency departments.

The dissertation lists three groups of criteria. Administrative reasons include a patient from another hospital who needs registration for a diagnostic test, a body that needs a record for the mortuary, a patient called for unscheduled treatment such as an organ transplant, a patient admitted for scheduled inpatient activity through the emergency registration desk, and a patient readmitted more than 24 hours after a transfer for consultation. Clinical reasons without an acute problem include a patient sent by a doctor for a procedure, test or re-evaluation that does not belong to emergency care, a patient sent for a scientific protocol, and a patient under the voluntary termination of pregnancy programme. Other reasons include a re-evaluation of a patient seen before and a blood sample taken for a counter-test on police order. In the audit the dissertation reports, 56.5 per cent of hospitals had not defined their criteria for white.

Ferreira and Baptista (2024) describe white as the GPT's way to identify and monitor demand for administrative reasons, such as returns for re-evaluation after discharge, tests, elective procedures and unscheduled treatment. Costa, Torres and Sousa (2022) list it as a sixth category called Não Classificável, with no target time. DGS Norma 002/2018 requires adult emergency services to implement the latest version of the Manchester system, lists five levels with times, and does not mention white. No source gives a reference value for white either.

What the family does with it: white is a neutral set of tokens, `extra.triage-white-fill`, `-border` and `-fg`, outside the ordered triage list. It has no priority, no protocol number and no target time, so it is not a level. The specimen shows it as a sixth row marked White and Branco, with the letter W where the others have a number.

### IEC 60601-1-8

The standard is paid and could not be read. Three sources that could be read were used. They agree on red for high priority and yellow for medium priority. For low priority the paper says cyan or yellow and the Philips guide shows a blue lamp.

- Table 1 of Damasceno and colleagues (2023), an open-access paper that tabulates the standard as adopted in Brazil: high priority is red and flashes at 1.4 to 2.8 Hz, medium priority is yellow and flashes at 0.4 to 0.8 Hz, low priority is cyan or yellow and steady.
- The MECA alarm standards cross-reference (2015), which says the standard sets the colour, flash frequency and duty cycle of alarm indicator lights. It also carries a rationale from the general standard: colour alone should not convey important information, and a redundant means such as shape, location, sound or marking is recommended.
- The Philips IntelliVue MX400-800 quick guide (2019), which shows the practice on a real monitor: a low-priority alarm has a blue lamp and message, a medium-priority alarm a yellow lamp with the mark `**` in the message, and a high-priority alarm a red lamp with the mark `***`.

How the family maps onto it: high priority is critical (red), medium is caution (yellow) and low is info (blue), as `design.alarm` says. Orange is not among the colours in these sources, so it stays out of the alarm mapping.

Not checked: the duty cycle values, the colours of advisory signals, the chromaticity limits that define cyan, whether an on-screen blue of OKLCH hue 255 counts as cyan, and the current text of the standard. The family's info blue sits on the blue side of cyan. If equipment alarms need a strict cyan, info is the level to change, and it would need a hue of its own apart from the triage blue. The family claims no conformance. A screen is also not an alarm indicator light, and flashing was not tested.

### Lab flags

The HL7 code system ObservationInterpretation (version 2018-08-12) names the codes H (high, above the reference range), L (low), HH (critical high, above a level at which immediate action should be considered), LL (critical low), N (normal), A (abnormal) and AA (critical abnormal). The US ONC's USCDI entry for the abnormal flag uses that code system. MyPathologyReport.ca, a site that explains laboratory reports to patients, says H and L mark results above and below the range and that some laboratories add A, an asterisk, bold text or coloured text. BloodSight describes H, L and C, with a star or a critical marker. No source read gives arrows or colours as a convention, and none describes Portuguese laboratory practice.

Jeroboam follows the HL7 letters, because they are coded and exchanged: `design.lab` gives low L, high H, critical low LL and critical high HH, each with an arrow icon token (single for low and high, double for critical) and a level (caution for low and high, critical for the doubled codes). The flag is always a letter, an arrow and a word, and a normal result carries no colour.

### Fonts

The brief asks for tabular figures and for I, l, 1, O and 0 to stay apart. Three candidates, all under the SIL Open Font License 1.1 according to the pages read:

- Inter. Its page lists the OpenType features `tnum` (tabular figures), `zero` (slashed zero), `ss02` (disambiguation, with a slashed zero), `cv05` (lower-case l with a tail) and `cv08` (upper-case i with a serif), and gives the licence as OFL 1.1. Every property the brief asks for is documented.
- Atkinson Hyperlegible Next. Its README gives OFL 1.1 and the aim of greater character recognition. Max Kohler's essay on the design (2021) says the original has a serif on the lower-case l and a slashed zero. Tabular figures were not confirmed on a primary page, only on third-party pages, so it was left out for that reason.
- JetBrains Mono. Its README gives OFL 1.1 and stresses that symbols stay distinct. Every digit in a monospaced face is tabular, but the shape of its zero was not checked.

The choice is Inter for `sans` and JetBrains Mono for `mono`, used for identifiers and rule text. Nothing is downloaded in this phase. The pages use the fonts only where they are installed, with a system fallback. The licence texts are shipped with the font files when they are fetched in phase 4. The specimen sets tabular and slashed figures with the standard CSS property `font-variant-numeric`, so it does not depend on the features. A generator should enable `tnum` and `ss02` for Inter, as `design.type.features` says.

### Sources

- Direção-Geral da Saúde, Norma 002/2018, Sistemas de Triagem dos Serviços de Urgência e Referenciação Interna Imediata, 9 January 2018. https://normas.dgs.min-saude.pt/wp-content/uploads/2019/10/sistemas-de-triagem-dos-servicos-de-urgencia-e-referenciacao-interna-imediata.pdf
- Grupo Português de Triagem, O Sistema de Triagem de Manchester e as Vias Verdes, 2011. http://www.grupoportuguestriagem.pt/wp-content/uploads/2021/02/Documentacao-Triagem-Manchester-e-as-Vias-Verdes.pdf
- António Marques da Silva, Triagem de Prioridades: Triagem de Manchester, master's dissertation in disaster medicine, Universidade do Porto, 2009, hosted by the GPT. https://www.grupoportuguestriagem.pt/wp-content/uploads/2021/01/2009-Tese-Mestrado-Anto%CC%81nio-Marques-Triagem-Prioridades-Manchester.pdf
- Ferreira CGG, Baptista MGJ, Dificuldades percecionadas pelos enfermeiros na realização da triagem de Manchester e fatores associados, Servir 2024;2(09):e32664, doi 10.48492/servir0209.32664. https://revistas.rcaap.pt/servir/article/download/32664/26092/169219
- Costa FAD, Torres RS, Sousa CPF, Triagem de Manchester: perceções dos enfermeiros sobre os seus contributos e fatores que a influenciam, Revista de Enfermagem Referência, série VI, n.º 1, 2022. https://www.redalyc.org/journal/3882/388271597022/html/
- Amthauer C, Cunha MLC, Manchester Triage System: main flowcharts, discriminators and outcomes of a pediatric emergency care, Revista Latino-Americana de Enfermagem, 2016. https://pmc.ncbi.nlm.nih.gov/articles/PMC5016055/
- Damasceno JS and colleagues, Development of an Educational Alarm System: Study of IEC 60601-1-8:2022, Alarm Systems in Electromedical Equipments, Journal of Bioengineering, Technologies and Health 2023;6(4):284-289. https://jbth.com.br/index.php/JBTH/article/download/322/259/
- MECA, Alarm Standards Cross-Reference, 2015. https://60601-1.com/wp-content/uploads/2019/04/meca-alarm-standards-cross-reference-2015-04-01.pdf
- Philips, IntelliVue Patient Monitor MX400-800 Quick Guide, 2019. https://www.usa.philips.com/c-dam/b2bhc/master/Specialties/covid/MX400-800_Quick%20Start_453564859801.pdf
- HL7, v3 Code System ObservationInterpretation, version 2018-08-12. https://hl7.org/fhir/R4/v3/ObservationInterpretation/cs.html
- ONC, USCDI, Test Interpretation (Abnormal Flag). https://isp.healthit.gov/uscdi-data/test-interpretation-abnormal-flag
- MyPathologyReport.ca, Understanding reference ranges and units on a laboratory report. https://www.mypathologyreport.ca/blood-tests/understanding-reference-ranges-and-units-on-a-laboratory-report/
- BloodSight, H, L and Critical flags on a lab report explained. https://bloodsight.com/learn/reading-flagged-values
- Inter, features. https://rsms.me/inter/
- Atkinson Hyperlegible Next, README. https://github.com/googlefonts/atkinson-hyperlegible-next
- Max Kohler, The Development of Atkinson Hyperlegible, 16 February 2021. https://www.maxkohler.com/notes/2021-02-16-atkinson-hyperreadable/
- JetBrains Mono, README. https://github.com/JetBrains/JetBrainsMono

Two of the pages were read through a page-reading tool that returned a summary: the redalyc page for Costa and colleagues and the MyPathologyReport.ca page. The PDFs were read as text.

## Flags and the light mode

The 3:1 rule for borders and the 12 L* rule for print pull against each other in the light mode, and the colours show it. On the light page, a border can be no lighter than L* 58.7. Five borders 12 L* apart span 48 L*, so the darkest is at L* 10.7 or below, where a blue is a navy that is close to black. The search allowed yellow from L* 54 and orange from L* 40, because a yellow darker than that reads as olive and an orange as brown, so yellow sits at the top and orange below it.

A grid search over the lightness of each flag, with two hues to choose from for each, inside the hue regions and with every pair 0.062 apart under each simulation, found 379,987 admissible plans in the light mode. None has every pair at 12 L* or more. The best has one pair below 12, yellow and orange at 9.1 L*. A hill-climb then moved the lightness and the hue of each flag in small steps, to raise the smallest colour-vision distance and then the lightness of red, green and blue, with every pair held at 12 L* or more. It found a plan in which every pair is at 12 L* or more, and the recorded plan is that one. The same grid search over the dark mode found 84,146,246 admissible plans, and the recorded dark plan is the one with the most chroma among those with no gap under 13 L*. Both searches are in `scripts/design/jeroboam.ts` (`--search` and `--refine`).

The price is visible. The light-mode blue is a navy (L* 8.4) and the red a dark maroon (L* 20.5). They are still a blue and a red by hue and they sit on pale tints of their own hue, but they are the darkest of the flag colours. In the dark mode there is room: every pair is at least 13.1 L* apart and the flags are bright.

| Flag | Light border | L* | Hue | On the page | Light fill | Text on fill | Dark border | L* | Dark fill | Text on fill |
|---|---|---|---|---|---|---|---|---|---|---|
| blue | #00173B | 8.4 | 257 | 16.02:1 | #DFF4FF | 10.24:1 | #005FD7 | 42.9 | #1D2C41 | 10.42:1 |
| green | #005A28 | 32.8 | 151 | 7.62:1 | #DDF7E5 | 10.15:1 | #69E86D | 82.8 | #1B2F1B | 10.42:1 |
| yellow | #9F8C00 | 58.2 | 100 | 3.05:1 | #F5F2D7 | 10.18:1 | #FFF95D | 95.9 | #2F2C0F | 10.36:1 |
| orange | #A45900 | 45.7 | 59 | 4.74:1 | #FFEFDB | 10.20:1 | #FF8A00 | 69.1 | #3D2615 | 10.36:1 |
| red | #6B0000 | 20.5 | 29 | 11.69:1 | #FFEEE7 | 10.21:1 | #EE4E34 | 56.0 | #40231E | 10.42:1 |

The contrast of a dark-mode border is on the dark page, #1A1713. The foreground colours are #003B64, #004320, #433900, #5A2E00 and #63261C in the light mode, and #C2E1FF, #B6E9B4, #E7DF99, #FFD5B0 and #FFD3C7 in the dark mode.

## The candidate

`candidates/royal-blue.tokens.json` trades two print pairs for a royal blue. It changes the light mode only. The blue moves from L* 8.4 to L* 23.3, a royal blue instead of a navy, and red, green and orange move up by 2.4, 2.6 and 2.5 L*. The price: the blue and the red border now print as nearly the same grey, 0.4 L* apart, and yellow and orange are 10.0 L* apart. The token file declares both pairs reinforced, for print only, by the protocol number and the word on every triage row and the fixed queue order from 1 to 5. The same blue and red pair is reinforced in the severity set by the icon and the word, a circle for information and an octagon for critical. The other eight pairs stay at 12.2 L* or more.

Colour vision needs no reinforcement in either file. The candidate's flags set keeps 0.070 in the light mode and 0.082 in the dark mode, and its link-and-accent set 0.063 in the light mode (the link against the blue under tritan simulation). The dark mode is identical in both files. The candidate passes the same four profiles, and the test in `tests/families/jeroboam.test.ts` locks what it reinforces. Choose the main file if you want every gate met by colour alone, and the candidate if the blue matters more than a blue and red that print alike. The local pages show both.

## Colour vision

Each figure is the smallest OKLab distance between two members of a set after simulation with the matrices of Machado, Oliveira and Fernandes (2009) at severity 1.0 in linear light (`lib/colour/cvd.ts`). The pair that has it is in brackets. Aliases are left out: the severity borders and the triage borders are the same colours.

| Set | Mode | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| flags | light | 0.132 (yellow, orange) | 0.072 (green, orange) | 0.071 (red, green) | 0.129 (yellow, orange) |
| flags | dark | 0.135 (red, orange) | 0.082 (yellow, green) | 0.090 (green, orange) | 0.108 (red, orange) |
| link-and-accent | light | 0.078 (link, accent) | 0.072 (green, orange) | 0.071 (red, green) | 0.078 (link, accent) |
| link-and-accent | dark | 0.106 (link, accent) | 0.082 (yellow, green) | 0.090 (green, orange) | 0.092 (link, yellow) |

Red and green are the closest pair under deutan simulation in the light mode, at 0.071. They are also 12.3 L* apart in greyscale.

The ink choice is measured in the design script. The smallest distance from a warm neutral ink (hue 72, chroma 0.012) to a flag, under any view, is between 0.035 and 0.066 over the lightnesses from L* 8 to 35 in the light mode, because the dark red, green and navy flags collapse towards such an ink after simulation. Only a narrow band near L* 20 clears 0.06, and a link and an accent that are also 0.06 apart from each other do not fit in it. The slate ink (chroma 0.024, hue 298) keeps 0.079 from every flag for the link and 0.080 for the accent in the light mode, and 0.092 and 0.151 in the dark mode.

## Print

Each set is gated in greyscale by the L* of the colour converted to its grey. The smallest gap between two triage borders is 12.2 L* in the light mode (blue and red) and 13.1 L* in the dark mode (blue and red, green and yellow, and orange and red). In the light mode the next smallest are 12.3 (green and red), 12.5 (yellow and orange) and 12.8 (green and orange). The severity borders are 12.2 L* or more apart in the light mode and 13.1 in the dark mode. The smallest text pair after conversion to grey is 7.27:1. No pair is reinforced in the main file.

## Measured results

| Check | Limit | Light | Dark |
|---|---|---|---|
| Text pairs (25 per mode), smallest | 7:1 | 7.34:1 (subtle text on the page) | 7.58:1 (subtle text on a card) |
| Body text on the page | 4.5:1 | 15.52:1 | 15.34:1 |
| Text on its fill, ten pairs | 4.5:1 | 10.15:1 to 17.15:1 | 10.36:1 to 13.07:1 |
| Component pairs (5 per mode), smallest | 3:1 | 5.23:1 (control outline on the page) | 4.45:1 (control outline on a card) |
| Flag border on the page, smallest | 3:1 | 3.05:1 (yellow) | 3.08:1 (blue) |
| Severity borders, smallest step | 8 L* | 37.6 L* | 40.0 L* |
| Triage borders, smallest step | 8 L* | 12.5 L* | 13.1 L* |
| Triage steps under deutan, smallest | 0.06 | 0.094 | 0.109 |
| Nearest colour to the critical red outside the status tokens | 0.10 | 0.144 | 0.197 |

## What Jeroboam is not for

- Clinical validation. The family does not check a triage algorithm, a decision rule or an alarm design, and it does not claim conformance with the Manchester protocol or with IEC 60601-1-8. A screen that shows an alarm still needs the testing the standard asks of the equipment.
- Charts. The family has no data scales. Enderby is the data family.
- Editors and terminals. The vscode, zed, neovim and terminals bundles are excluded.
- Patients. Rachel is the family for patient-facing screens and leaflets. Jeroboam's text is for professionals at a desk or a bedside.
- Flashing alarms. Nothing here specifies flash rate or duty cycle.

## Licence

Code is MIT; colour tokens and documentation are CC BY 4.0. See the root `LICENSE`.
