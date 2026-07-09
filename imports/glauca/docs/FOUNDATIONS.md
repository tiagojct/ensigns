# Foundations

## The name

*Glaucus* is the Latin for a colour the Romans could point to and we have lost
the habit of naming: the pale blue-grey-green of a cabbage leaf's bloom, of
sea water under an overcast sky, of certain eyes. Botanists still use it — a
*glaucous* leaf carries a waxy film (the *pruina*, hoarfrost) that scatters
light and cools the green beneath. Glaucus is also a sea-god: a fisherman who
ate a herb, turned blue-green, and dove into the deep.

Glauca takes both. The light mode, **Pruina**, is the bloom itself: a pale
frost field, even and calm. The dark mode, **Profundum**, is the deep the god
lives in. Light comes first; the deep answers.

## The rule

One vivid sky-blue — *dies*, #007AFF — is the only hot signal in the system,
and it is kept rare. It marks what carries weight: the link you can follow,
the focus you are on, the cursor, the button, the one callout whose job is
"notice this". Everything else is field: pale neutrals, stone greys,
desaturated bloom tints. Scarcity is not a layout preference; it is what makes
the mark legible. A page full of blue says nothing.

This is the same ethic as the sibling system, Try-Works, with the poles
reversed: there, a dark sea and one ember; here, a frost bloom and one clear
blue. Both are a cold field with a single load-bearing mark.

## The transparency ethic

The system is built against interfaces that hide how they work behind a clean
surface. Practically: one readable JSON file is the entire source of truth;
every surface is generated from it by scripts you can read; the accessibility
claims are tests that fail the build, not adjectives; and the palette's
reasoning — including the places it bends — is written down here. Glass, not
lacquer.

## The three anchors

The palette is built around three fixed points, placed where they can be
verified rather than sprinkled as decoration:

- **dies #007AFF** — the mark. It measures 4.5:1 against the dark ground (so
  it may carry dark-mode keywords) but under 4.5:1 against the pale ground, so
  in light mode it serves as the large/UI mark (accent-bright) while
  text-level accents use its darker relatives. Light hovers darken; dark
  hovers brighten. Both rules are locked as contrast tests in validate.py.
- **folium #62BA46** — the leaf. The working signal for growth and success,
  the string colour, the terminal's bright green, the dataviz green. It lives
  in the extended tier: everywhere code lives, never on a poster.
- **cinis #8C8C8C** — the ash. The neutral pivot: exactly the dark mode's
  muted text (5.4:1 on the dark ground), the light mode's faint tier, the
  comment colour.

## The code exception

The identity rule says blue is rare. The code tier breaks this knowingly:
keywords are *dies* and strings are *folium*, because a code palette must
first serve colour-blind readers, and blue is the hue all three axes of
colour-vision deficiency see most reliably. The measured close pairs
(number/function under protan and deutan; function/type under tritan) are
reinforced with weight and italics — bold keywords, italic types, italic
numbers, italic comments — so no distinction rides on hue alone. The exception
is stated, bounded, and tested (`make cvd`); an ethic that cannot name its own
exceptions is a mood.

## Light first

Try-Works reads by lamplight; Glauca reads by day. The light mode is the
default at `:root`, the file named plainly (`Glauca.itermcolors`,
`glauca.zsh-theme`) is the light one, and the dark variant carries the suffix.
This is a deliberate inversion of the sibling system, not an afterthought: the
bloom is the identity, and the bloom is pale.

## Provisionality

Version 0.x. The token names — saxum, glaucum, caelum, pruina; pix, umbra,
petra, ferrum; caligo, vadum, spuma, nebula; dies, aer, imum; charta, cinis;
folium, bacca, viola, lacus, unda — are Latin because the author already names
things in Latin, and because a dead language does not drift under a living
system. The public surface freezes at 1.0.
