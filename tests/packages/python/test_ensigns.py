"""Checks the generated Python package against what it promises.

npm run packages writes the package to dist/packages/python. The CI installs it with its plot
extra and pytest into a fresh virtual environment, then runs this file against that copy:

    python -m pip install "./dist/packages/python[plot]" pytest
    python -m pytest tests/packages/python
"""
import importlib
import io
import re
from importlib.resources import files

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pytest
from matplotlib.colors import to_hex

import ensigns

MODES = ("light", "dark")
FAMILY_MODES = [(family, mode) for family in ensigns.FAMILIES for mode in MODES]
HEX = re.compile(r"#[0-9A-F]{6}")


def has_chart_palette(family, mode):
    return any(address.startswith("data.") for address in ensigns.colours(family, mode))


CHART_MODES = [fm for fm in FAMILY_MODES if has_chart_palette(*fm)]
CHART_FAMILIES = sorted({family for family, _ in CHART_MODES})


def plot_background(colours):
    for address in ("data.plot.bg", "data.plot.background"):
        if address in colours:
            return colours[address]["hex"]
    return colours["roles.bg"]["hex"]


@pytest.fixture(autouse=True)
def restore_matplotlib():
    with matplotlib.rc_context():
        yield
    plt.close("all")


def test_lists_the_ten_families_it_ships():
    shipped = sorted(p.name[: -len(".json")] for p in files("ensigns").joinpath("data").iterdir() if p.name.endswith(".json"))
    assert len(ensigns.FAMILIES) == 10
    assert sorted(ensigns.FAMILIES) == shipped


@pytest.mark.parametrize("family", ensigns.FAMILIES)
def test_tokens_load(family):
    tokens = ensigns.tokens(family)
    assert tokens["meta"]["id"] == family
    assert sorted(tokens["modes"]) == sorted(MODES)


@pytest.mark.parametrize("family, mode", FAMILY_MODES)
def test_colours_load_for_every_family_mode(family, mode):
    colours = ensigns.colours(family, mode)
    assert {"roles.bg", "roles.text"} <= colours.keys()
    for address, colour in colours.items():
        assert HEX.fullmatch(colour["hex"]), address
        assert colour["from"], address
        assert 0 < colour.get("alpha", 1) <= 1, address


def test_rejects_an_unknown_family_or_mode():
    with pytest.raises(ValueError):
        ensigns.tokens("ahab")
    with pytest.raises(ValueError):
        ensigns.colours("pequod", "sepia")
    with pytest.raises(ValueError):
        ensigns.use("pequod", "sepia")


def test_ships_a_style_for_each_family_mode_with_a_chart_palette():
    styles = sorted(p.name for p in files("ensigns").joinpath("styles").iterdir() if p.name.endswith(".mplstyle"))
    assert styles
    assert styles == sorted(f"{family}-{mode}.mplstyle" for family, mode in CHART_MODES)


@pytest.mark.parametrize("family, mode", [fm for fm in FAMILY_MODES if fm not in CHART_MODES])
def test_use_refuses_a_family_mode_without_a_chart_palette(family, mode):
    with pytest.raises(ValueError, match="no authored chart palette"):
        ensigns.use(family, mode)


@pytest.mark.parametrize("family, mode", CHART_MODES)
def test_use_applies_the_style_of_that_family_mode(family, mode):
    colours = ensigns.colours(family, mode)
    categorical = [colour["hex"].lower() for address, colour in colours.items() if address.startswith("data.categorical.")]
    ensigns.use(family, mode)
    assert to_hex(plt.rcParams["figure.facecolor"]) == plot_background(colours).lower()
    if categorical:
        assert [to_hex(c) for c in plt.rcParams["axes.prop_cycle"].by_key()["color"]] == categorical


@pytest.mark.parametrize("family, mode", CHART_MODES)
def test_a_figure_renders_with_agg(family, mode):
    ensigns.use(family, mode)
    fig, ax = plt.subplots()
    for i in range(3):
        ax.plot([0, 1], [i, i + 1], label=f"series {i + 1}")
    ax.legend()
    fig.canvas.draw()
    assert matplotlib.get_backend().lower() == "agg"
    assert bytes(fig.canvas.buffer_rgba())[:3] == bytes.fromhex(plot_background(ensigns.colours(family, mode))[1:])
    png = io.BytesIO()
    fig.savefig(png, format="png")
    assert png.getvalue().startswith(b"\x89PNG\r\n\x1a\n")


@pytest.mark.parametrize("family", CHART_FAMILIES)
def test_register_cmaps_registers_every_authored_ramp(family):
    ramps = {}
    for mode in MODES:
        for address, colour in ensigns.colours(family, mode).items():
            parts = address.split(".")
            if parts[:2] in (["data", "sequential"], ["data", "diverging"]):
                ramps.setdefault(f"{family}_{mode}_{parts[2]}", {})[int(parts[3])] = colour["hex"].lower()
    importlib.import_module(f"ensigns.styles.{family}_colours").register_cmaps()
    for name, steps in ramps.items():
        colormap = matplotlib.colormaps[name]
        assert to_hex(colormap(0.0)) == steps[min(steps)], name
        assert to_hex(colormap(1.0)) == steps[max(steps)], name
