#!/usr/bin/env Rscript
# Writes tests/fixtures/reference/palettes.json, the reference palettes the
# figure profile measures Enderby against: Okabe-Ito for categorical colours,
# viridis and cividis for sequential ramps.
#
# Sources, all installed locally (nothing is downloaded):
#   Okabe-Ito: grDevices::palette.colors(palette = "Okabe-Ito"), the first eight
#     entries (the ninth, grey, is R's addition). Okabe and Ito (2008),
#     "Color Universal Design".
#   viridis and cividis: viridisLite::viridis(256) and viridisLite::cividis(256).
#     Viridis is by Smith and van der Walt (matplotlib); cividis is by Nunez,
#     Anderton and Renslow (2018), doi:10.1371/journal.pone.0199239.
#
# The hex values live in tests/fixtures because no colour value may be typed in
# lib/. lib/harness/figure.ts reads the file.
#
# Run from the repository root:
#   Rscript scripts/gen-reference-palettes.R

library(jsonlite)

output_path <- "tests/fixtures/reference/palettes.json"
dir.create(dirname(output_path), showWarnings = FALSE, recursive = TRUE)

oi <- grDevices::palette.colors(palette = "Okabe-Ito", names = TRUE)[1:8]
okabe_ito <- as.list(toupper(unname(oi)))
names(okabe_ito) <- names(oi)

# viridisLite returns #RRGGBBAA; the alpha is always FF.
ramp <- function(f) toupper(substr(f(256), 1, 7))

out <- list(
  generated_with = paste0("R ", getRversion(), ", viridisLite ", as.character(packageVersion("viridisLite"))),
  `okabe-ito` = list(
    source = "Okabe and Ito (2008), Color Universal Design, via grDevices::palette.colors(palette = 'Okabe-Ito')[1:8]",
    colors = okabe_ito
  ),
  viridis = list(
    source = "viridisLite::viridis(256)",
    colors = ramp(viridisLite::viridis)
  ),
  cividis = list(
    source = "viridisLite::cividis(256)",
    colors = ramp(viridisLite::cividis)
  )
)

writeLines(toJSON(out, auto_unbox = TRUE, pretty = TRUE), output_path)
cat("wrote", output_path, "\n")
