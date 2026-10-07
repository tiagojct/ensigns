\name{ensigns}
\alias{ensigns_tokens}
\alias{ensigns_colours}
\alias{theme_ensigns}
\alias{scale_colour_ensigns}
\alias{scale_fill_ensigns}
\title{Ensigns Colour Families}
\description{Read resolved colour data and use authored colours in ggplot2. Colour data are CC BY 4.0, Tiago Jacinto.}
\usage{
ensigns_tokens(family = "pequod")
ensigns_colours(family = "pequod", mode = "light")
theme_ensigns(family = "pequod", mode = "light", base_size = 11)
scale_colour_ensigns(family = "pequod", mode = "light", ...)
scale_fill_ensigns(family = "pequod", mode = "light", ...)
}
\arguments{
\item{family}{One of the ten family identifiers.}
\item{mode}{Either light or dark.}
\item{base_size}{Base type size in points.}
\item{...}{Arguments passed to the ggplot2 discrete scale.}
}
\value{A list of tokens or colours, a ggplot2 theme, or a discrete scale.}
\details{Use labels and authored marker or pattern cues alongside colours. Families without categorical palettes raise an error when asked for a discrete scale.}
\examples{
ensigns_tokens("pequod")$meta$name
ensigns_colours("townho", "dark")[["roles.bg"]]$hex
if (requireNamespace("ggplot2", quietly = TRUE)) {
  ggplot2::ggplot(mtcars, ggplot2::aes(wt, mpg, colour = factor(cyl), shape = factor(cyl))) +
    ggplot2::geom_point() +
    scale_colour_ensigns("pequod", "dark") +
    theme_ensigns("pequod", "dark")
}
}
