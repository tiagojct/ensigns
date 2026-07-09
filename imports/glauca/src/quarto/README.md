# Glauca for Quarto

Generated from glauca.json. Two outputs, one identity.

## HTML
glauca.scss (light, Pruina) and glauca-dark.scss (dark, Profundum) are
Quarto Bootstrap themes: IBM Plex Serif headings, IBM Plex Sans body, the blue as link and
accent. glauca.theme is a pandoc highlight theme built from the code map.

    format:
      html:
        theme: { light: glauca.scss, dark: glauca-dark.scss }
        highlight-style: glauca.theme

## PDF (Typst)
typst-brand.typ is injected into the Typst preamble; it sets IBM Plex Sans body,
IBM Plex Serif headings, and the blue for first-level headings and links.

    format:
      typst:
        include-in-header: typst-brand.typ

Provide the fonts (IBM Plex Serif, Sans, and Mono) to your
environment; subset them as in fonts/README.md. See example/ for a full config.
