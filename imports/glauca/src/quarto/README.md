# Glauca for Quarto

Generated from glauca.json. Two outputs, one identity.

## HTML
glauca.scss (light, Pruina) and glauca-dark.scss (dark, Profundum) are
Quarto Bootstrap themes: IBM Plex Serif headings, IBM Plex Sans body, the blue as link and
accent. glauca.theme (light) and glauca-dark.theme (dark) are pandoc highlight
themes built from the code map, one per mode so code blocks follow the page.

    format:
      html:
        theme: { light: glauca.scss, dark: glauca-dark.scss }
        highlight-style: { light: glauca.theme, dark: glauca-dark.theme }

## PDF (Typst)
typst-brand.typ is injected into the Typst preamble; it sets IBM Plex Sans body,
IBM Plex Serif headings, and the blue for first-level headings and links.

    format:
      typst:
        include-in-header: typst-brand.typ

Provide the fonts (IBM Plex Serif, Sans, and Mono) to your
environment; subset them as in `src/fonts/README.md` in the repo. See example/ for a full config.
