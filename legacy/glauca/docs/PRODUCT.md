# Glauca — product notes

## Who it is for
An audience of roughly one, honestly: an academic-maker who ships websites,
slides, posters, code, and statistical plots, in R and Python and Quarto and
Typst and 11ty — light-first, clinical-clean. Others may adopt it, but the
design target is that workflow. Naming the user this plainly changes the scope
rule: a surface earns its place only if it is used in that workflow, or
clearly will be. Everything else is maintenance debt wearing a feature's
clothes.

## Where Glauca stands
Glauca inherits the complete surface set from its dark sibling, try-works, at
birth: R/Python plotting, Typst slides and posters, CSS + 11ty, Tailwind, VS
Code (two themes + icons), Zed, Obsidian, Ghostty/iTerm2, oh-my-zsh, Vivaldi,
Quarto, Miniflux, MarkEdit, PowerPoint, and the print spec. Nothing had to be
earned surface-by-surface this time; the discipline is inverted — hold the
line, prune what proves idle.

Three surfaces were added rather than inherited: **Firefox**, **Thunderbird**,
and **Zotero**. They pass the test above on the same argument — reading,
correspondence, and reference management are where the named workflow actually
spends its hours, and they were the only such hours still lit by someone else's
palette. All three are the same kind of artefact as the surfaces already here
(a colour table generated from the json), so they add tokens to maintain, not
machinery: the two Gecko themes share one chrome table, and the Zotero theme is
a stylesheet with no build step.

## The weekly-use test
From the foundations, after Illich: keep what is touched often and convivial;
question what sits idle. Because Glauca is the second system, the honest test
is different: which surfaces get used *in Glauca* rather than in try-works?
Both systems ship the same machinery, so switching cost is near zero; usage
will sort the two palettes by context (day work vs night work, clinical decks
vs literary ones). Revisit after a season of real use.

## Scope line
The reading-and-reference set (Firefox, Thunderbird, Zotero) closes the gap
between the tools this workflow writes in and the tools it reads in. That is
the line: no further surfaces before 1.0. The token core is complete and tested
(18 WCAG rows, CVD pass, drift gate), and the Plex fallback metrics are
measured. Between now and 1.0: real-world use and a specimen pass. Then freeze
the public surface and commit to the versioning policy.
