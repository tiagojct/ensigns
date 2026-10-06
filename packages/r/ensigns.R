# Code MIT. Colour data are CC BY 4.0, Tiago Jacinto.
ensigns_tokens <- function(family = "pequod") {
  families <- c("pequod", "goney", "townho", "jeroboam", "jungfrau", "rosebud", "enderby", "bachelor", "rachel", "delight")
  if (length(family) != 1 || !family %in% families) stop("Unknown family")
  path <- system.file("tokens", paste0(family, ".json"), package = "ensigns")
  if (!nzchar(path)) stop("Token file is missing from the installed package")
  jsonlite::fromJSON(path, simplifyVector = FALSE)
}
ensigns_colours <- function(family = "pequod", mode = "light") {
  mode <- match.arg(mode, c("light", "dark"))
  ensigns_tokens(family)$modes[[mode]]$colours
}
.plot <- function(colours, keys, fallback) {
  for (key in keys) if (!is.null(colours[[paste0("data.plot.", key)]])) return(colours[[paste0("data.plot.", key)]]$hex)
  colours[[paste0("roles.", fallback)]]$hex
}
theme_ensigns <- function(family = "pequod", mode = "light", base_size = 11) {
  if (!requireNamespace("ggplot2", quietly = TRUE)) stop("Install ggplot2 to use theme_ensigns")
  colours <- ensigns_colours(family, mode)
  ggplot2::theme_minimal(base_size = base_size) + ggplot2::theme(
    plot.background = ggplot2::element_rect(fill = .plot(colours, c("bg", "background"), "bg"), colour = NA),
    panel.background = ggplot2::element_rect(fill = .plot(colours, c("panel", "bg", "background"), "surface"), colour = NA),
    panel.grid.major = ggplot2::element_line(colour = .plot(colours, "grid", "border")),
    panel.grid.minor = ggplot2::element_blank(),
    text = ggplot2::element_text(colour = .plot(colours, "text", "text")),
    axis.text = ggplot2::element_text(colour = .plot(colours, c("muted", "text-muted"), "text-muted"))
  )
}
.scale <- function(family, mode, aesthetic, ...) {
  if (!requireNamespace("ggplot2", quietly = TRUE)) stop("Install ggplot2 to use chart scales")
  colours <- ensigns_colours(family, mode)
  values <- vapply(colours[startsWith(names(colours), "data.categorical.")], function(x) x$hex, character(1))
  if (!length(values)) stop("This family has no authored categorical palette")
  ggplot2::scale_discrete_manual(aesthetics = aesthetic, values = unname(values), ...)
}
scale_colour_ensigns <- function(family = "pequod", mode = "light", ...) .scale(family, mode, "colour", ...)
scale_fill_ensigns <- function(family = "pequod", mode = "light", ...) .scale(family, mode, "fill", ...)
