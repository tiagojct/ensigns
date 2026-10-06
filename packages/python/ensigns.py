"""Ensigns tokens and optional matplotlib styles. Colour data: CC BY 4.0."""
import json
from importlib.resources import files

FAMILIES = ("pequod", "goney", "townho", "jeroboam", "jungfrau", "rosebud", "enderby", "bachelor", "rachel", "delight")


def tokens(family="pequod"):
    """Return the resolved family, including source references and design cues."""
    if family not in FAMILIES:
        raise ValueError("Unknown family: " + str(family))
    return json.loads(files("ensigns").joinpath("data", family + ".json").read_text(encoding="utf-8"))


def colours(family="pequod", mode="light"):
    """Return every authored colour by address, retaining opacity and styles."""
    if mode not in ("light", "dark"):
        raise ValueError("Mode must be light or dark")
    return tokens(family)["modes"][mode]["colours"]


def use(family="pequod", mode="light"):
    """Apply an authored matplotlib style; requires matplotlib."""
    colours(family, mode)
    path = files("ensigns").joinpath("styles", family + "-" + mode + ".mplstyle")
    if not path.is_file():
        raise ValueError("This family has no authored chart palette")
    import matplotlib.pyplot as plt
    plt.style.use(str(path))
