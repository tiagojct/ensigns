#!/usr/bin/env python3
"""Measure the brief's CVD gate on the hue sets of the old repositories.

Usage:
    python3 cvd_gate.py [path/to/clones]

The clones directory holds pequod, glauca, try-works and ambergris (default: the
ENSIGNS_CLONES environment variable). The Machado et al. (2009) matrices are read from
culori's source file at run time (public, MIT). Standard library only.

The matrices are applied in linear light and the distance is Euclidean in OKLab. Severity 1.0
is row 10 of each table (rows run 0.0 to 1.0 in steps of 0.1); severity 0.5 is row 5.
For each set the script prints the minimum pairwise distance under normal vision and under
protan, deutan and tritan simulation, and how many pairs fall below the gate of 0.06.
"""
import json
import math
import os
import re
import sys
import urllib.request
from itertools import combinations

C = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ENSIGNS_CLONES", ".")
SRC = "https://raw.githubusercontent.com/evercoder/culori/main/src/deficiency.js"
GATE = 0.06

text = urllib.request.urlopen(SRC, timeout=30).read().decode()


def table(name):
    block = re.search(r"const %s = \[(.*?)\n\];" % name, text, re.S).group(1)
    nums = [float(x) for x in re.findall(r"-?\d+\.\d+|-?\d+", block)]
    assert len(nums) == 99, name
    return [nums[i * 9:(i + 1) * 9] for i in range(11)]


MATRIX = {k: table(k.upper()) for k in ("prot", "deuter", "trit")}


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def linear_rgb(h):
    h = h.lstrip("#")
    return [lin(int(h[i:i + 2], 16)) for i in (0, 2, 4)]


def oklab_from_linear(r, g, b):
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def simulate(h, kind, row=10):
    r, g, b = linear_rgb(h)
    a = MATRIX[kind][row]
    out = [min(1, max(0, a[0] * r + a[1] * g + a[2] * b)),
           min(1, max(0, a[3] * r + a[4] * g + a[5] * b)),
           min(1, max(0, a[6] * r + a[7] * g + a[8] * b))]
    return oklab_from_linear(*out)


def report(label, colours):
    print(f"\n{label}")
    for kind in (None, "prot", "deuter", "trit"):
        pts = {n: (oklab_from_linear(*linear_rgb(h)) if kind is None else simulate(h, kind)) for n, h in colours.items()}
        pairs = sorted((math.dist(pts[x], pts[y]), x, y) for x, y in combinations(pts, 2))
        below = [p for p in pairs if p[0] < GATE]
        name = "normal" if kind is None else kind
        extra = "" if not below else "  " + ", ".join(f"{a}/{b} {d:.3f}" for d, a, b in below[:5])
        print(f"  {name:7s} minimum {pairs[0][0]:.3f} ({pairs[0][1]}/{pairs[0][2]}); below {GATE}: {len(below)} of {len(pairs)}{extra}")


P = json.load(open(f"{C}/pequod/pequod.json"))
for mode in ("light", "dark"):
    report(f"Pequod crew, {mode}", {n: c[mode] for n, c in P["accents"].items()})
proposal = {n: c["light"] for n, c in P["accents"].items()}
proposal.update({"starbuck": "#066C93", "ishmael": "#69645F", "tashtego": "#04744D", "stubb": "#A74605", "ahab": "#932038"})
report("Pequod crew, light, with the corrections proposed in the brief", proposal)

hues = ("keyword", "string", "number", "function", "type", "decorator")
G = json.load(open(f"{C}/glauca/src/glauca.json"))
T = json.load(open(f"{C}/try-works/src/try-works.json"))
A = json.load(open(f"{C}/ambergris/tokens.json"))
report("Glauca code hues (dark set)", {k: G["code"][k]["color"] for k in hues})
report("Try-Works code hues (dark set)", {k: T["code"][k]["color"] for k in hues})
ansi = {k: A["ansi"][k]["hex"] for k in ("red", "green", "yellow", "blue", "magenta")}
ansi["cyan"] = A["color"]["accent"]["400"]["hex"]
report("Ambergris ANSI hue slots (dark set)", ansi)

OKABE_ITO = {"black": "#000000", "orange": "#E69F00", "skyblue": "#56B4E9", "green": "#009E73",
             "yellow": "#F0E442", "blue": "#0072B2", "vermillion": "#D55E00", "purple": "#CC79A7"}
report("Okabe-Ito, eight colours (reference for Enderby)", OKABE_ITO)
