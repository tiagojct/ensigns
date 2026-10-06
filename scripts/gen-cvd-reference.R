#!/usr/bin/env Rscript
# Writes tests/fixtures/colour/cvd-reference.json, the reference that the
# colour-vision-deficiency simulation in lib/colour/cvd.ts is tested against.
#
# Source: colorspace::simulate_cvd(linear = TRUE), which applies the
# Machado, Oliveira and Fernandes (2009) matrices to linear-light sRGB.
# In colorspace 2.1.3 the matrix tables are protanomaly_cvd,
# deutanomaly_cvd and tritanomaly_cvd; interpolate_cvd_transform() mixes
# two neighbouring rows for severities between the tabulated steps of 0.1,
# as protan(), deutan() and tritan() do.
#
# The input colours are read from tests/fixtures/colour/cvd-inputs.json,
# so no colour value is typed outside tests/.
#
# Run from the repository root:
#   Rscript scripts/gen-cvd-reference.R

library(colorspace)
library(jsonlite)

inputs_path <- "tests/fixtures/colour/cvd-inputs.json"
output_path <- "tests/fixtures/colour/cvd-reference.json"
if (!file.exists(inputs_path)) {
  cli::cli_abort(
    "Cannot find {.file {inputs_path}}. Run this script from the repository root."
  )
}

tables <- list(
  protan = protanomaly_cvd,
  deutan = deutanomaly_cvd,
  tritan = tritanomaly_cvd
)
# 0.33 is off the table grid with unequal weights (0.7 and 0.3), so it
# catches swapped interpolation weights; 0.75 alone would not.
severities <- c(0.33, 0.5, 0.75, 1)

# The two transfer functions below copy the steps inside simulate_cvd()
# for hex input. They give the linear-light result before encoding and
# rounding; the check further down proves the copy matches.
srgb_to_linear <- function(x) {
  x <- x / 255
  y <- ((x + 0.055) / 1.055)^2.4
  small <- x <= 0.03928
  y[small] <- x[small] / 12.92
  y * 255
}
linear_to_srgb <- function(y) {
  y <- y / 255
  x <- 1.055 * y^(1 / 2.4) - 0.055
  small <- y <= 0.03928 / 12.92
  x[small] <- 12.92 * y[small]
  x * 255
}

colours <- fromJSON(inputs_path)$colours
decoded <- srgb_to_linear(col2rgb(colours$hex))
rownames(decoded) <- c("R", "G", "B")

cases <- list()
for (type in names(tables)) {
  for (severity in severities) {
    transform <- interpolate_cvd_transform(tables[[type]], severity)
    output <- simulate_cvd(colours$hex, transform, linear = TRUE)
    # Matrix input skips the transfer functions: product and clamp only.
    linear <- simulate_cvd(decoded, transform, linear = TRUE)
    reencoded <- rgb(t(round(linear_to_srgb(linear))), maxColorValue = 255)
    if (!identical(unname(reencoded), unname(output))) {
      cli::cli_abort(
        "Linear-light copy disagrees with simulate_cvd() for {type} at severity {severity}."
      )
    }
    for (i in seq_along(colours$hex)) {
      cases[[length(cases) + 1L]] <- list(
        input = colours$hex[i],
        group = colours$group[i],
        type = type,
        severity = severity,
        output = output[i],
        linear = unname(linear[, i] / 255)
      )
    }
  }
}

reference <- list(
  source = "scripts/gen-cvd-reference.R",
  r = R.version.string,
  colorspace = as.character(packageVersion("colorspace")),
  method = paste(
    "simulate_cvd(input, interpolate_cvd_transform(<type>anomaly_cvd, severity),",
    "linear = TRUE); linear is the clamped linear-light RGB (0 to 1) before",
    "encoding and rounding"
  ),
  matrices = lapply(tables, function(table) {
    unname(lapply(table, function(m) as.vector(t(m))))
  }),
  cases = cases
)

writeLines(
  toJSON(reference, auto_unbox = TRUE, digits = NA, pretty = TRUE),
  output_path
)
cli::cli_inform(
  "Wrote {length(cases)} case{?s} for {nrow(colours)} colours to {.file {output_path}}."
)
