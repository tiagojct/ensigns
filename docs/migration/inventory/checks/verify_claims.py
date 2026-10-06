#!/usr/bin/env python3
"""Check the numeric claims in the Ensigns brief against the token files of the old repositories.

Usage:
    python3 verify_claims.py [path/to/clones]

The clones directory holds gam, pequod, glauca, try-works and ambergris (default: the
ENSIGNS_CLONES environment variable). Standard library only. Read-only.

Contrast is WCAG 2.x. Distance is Euclidean in OKLab, as in the brief's
"minimum pairwise OKLab distance". Blends are straight alpha composites in sRGB,
the way a code editor draws them.
"""
import json
import math
import os
import sys
from itertools import combinations

C = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ENSIGNS_CLONES", ".")


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def lum(h):
    r, g, b = (lin(x) for x in rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def wcag(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def oklab(h):
    r, g, b = (lin(x) for x in rgb(h))
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def dist(a, b):
    return math.dist(oklab(a), oklab(b))


def oklch(h):
    L, a, b = oklab(h)
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


def min_pair(d):
    return min((dist(d[x], d[y]), x, y) for x, y in combinations(d, 2))


def blend(fg, alpha, bg):
    return "#" + "".join(f"{round(f * alpha + g * (1 - alpha)):02X}" for f, g in zip(rgb(fg), rgb(bg)))


P = json.load(open(f"{C}/pequod/pequod.json"))
log, crew = P["log"], P["accents"]
ref = lambda r: log[r.split(".")[1]]

print("=" * 78)
print("PEQUOD: crew accents on the three backgrounds of each mode (WCAG contrast)")
for mode, label in (("light", "Parchment"), ("dark", "Below deck")):
    R = P["roles"][mode]
    bgs = {k: ref(R[k]) for k in ("bg", "bg-alt", "surface")}
    print(f"\n{label}: " + ", ".join(f"{k}={v}" for k, v in bgs.items()))
    for n, c in crew.items():
        print(f"  {n:9s} {c[mode]}  " + "  ".join(f"{wcag(c[mode], b):5.2f}" for b in bgs.values()))
    print("  below 4.5 on bg:", [n for n, c in crew.items() if wcag(c[mode], bgs["bg"]) < 4.5])

print("\nMinimum pairwise OKLab distance among the crew")
for mode in ("light", "dark"):
    m = min_pair({n: c[mode] for n, c in crew.items()})
    print(f"  {mode}: {m[0]:.3f} ({m[1]} / {m[2]})")
print(f"  Stubb to Ahab, light: {dist(crew['stubb']['light'], crew['ahab']['light']):.3f}")

print("\nThe brief's proposed corrections")
prop = {n: c["light"] for n, c in crew.items()}
prop.update({"starbuck": "#066C93", "ishmael": "#69645F", "tashtego": "#04744D", "stubb": "#A74605", "ahab": "#932038"})
bg = ref(P["roles"]["light"]["bg"])
for n in ("starbuck", "ishmael", "tashtego", "stubb", "ahab"):
    print(f"  {n:9s} {crew[n]['light']} -> {prop[n]}: {wcag(crew[n]['light'], bg):.2f} -> {wcag(prop[n], bg):.2f} on {bg}")
m = min_pair(prop)
print(f"  proposed light set: minimum {m[0]:.3f} ({m[1]} / {m[2]}); Stubb to Ahab {dist(prop['stubb'], prop['ahab']):.3f}")
alone = dict(prop)
alone.update({"stubb": "#A94611", "ahab": crew["ahab"]["light"]})
print(f"  Stubb darkened alone to #A94611: {wcag('#A94611', bg):.2f}:1, Stubb to Ahab {dist('#A94611', crew['ahab']['light']):.3f}")
dbg = ref(P["roles"]["dark"]["bg"])
print(f"  Daggoo dark {crew['daggoo']['dark']} -> #A4736C on {dbg}: {wcag(crew['daggoo']['dark'], dbg):.2f} -> {wcag('#A4736C', dbg):.2f}")
pd = {n: c["dark"] for n, c in crew.items()}
pd["daggoo"] = "#A4736C"
print(f"  dark set minimum with the corrected Daggoo: {min_pair(pd)[0]:.3f}")

print("\nThe same corrected values on the surfaces the VS Code themes actually draw")
dark_line = blend("#0C222F", 0x80 / 255, "#0B1720")
light_line = blend("#DBC9B6", 0x80 / 255, "#F7F3EE")
print(f"  current line: Below deck {dark_line}, Parchment {light_line}; Parchment editor background #F7F3EE")
print(f"  Daggoo dark #A4736C: {wcag('#A4736C', dark_line):.2f} on the current line")
for n in ("starbuck", "ishmael", "tashtego", "stubb"):
    print(f"  {n:9s} {prop[n]}: {wcag(prop[n], '#F7F3EE'):.2f} on the editor background, {wcag(prop[n], light_line):.2f} on the current line")

print("\nPequod Log scale in OKLCH (hue break between 500 and 600)")
prev = None
for k, v in log.items():
    L, Cc, h = oklch(v)
    step = "" if prev is None else f"  dH {((h - prev + 180) % 360) - 180:+7.1f}"
    print(f"  log {k:>3s} {v}  L {L:.3f}  C {Cc:.3f}  h {h:6.1f}{step}")
    prev = h

print()
print("=" * 78)
print("GLAUCA and TRY-WORKS: modes, text contrast, brightest entries")
for fam, path in (("Glauca", "glauca/src/glauca.json"), ("Try-Works", "try-works/src/try-works.json")):
    T = json.load(open(f"{C}/{path}"))
    print(f"\n{fam} {T['version']}: mode keys {list(T['modes'])}")
    for mk, mv in T["modes"].items():
        print(f"  {mk} ({mv['label']}, {mv['scheme']}): bg {mv['bg']} luminance {lum(mv['bg']):.4f}; text {wcag(mv['text'], mv['bg']):.2f}:1; muted {wcag(mv['text-muted'], mv['bg']):.2f}:1")
    flat = {f"{g}.{k}": v for g, items in T["palette"].items() for k, v in items.items()}
    top = sorted(flat.items(), key=lambda kv: -lum(kv[1]))[:3]
    print("  brightest palette entries:", ", ".join(f"{k} {v} ({lum(v):.3f})" for k, v in top))

T = json.load(open(f"{C}/try-works/src/try-works.json"))
gnd = T["modes"]["lit"]["bg"]
print("\nTry-Works code colours on the dark ground (flag: hue 230 to 290 and chroma above 0.04)")
for k, v in T["code"].items():
    L, Cc, h = oklch(v["color"])
    flag = "  blue text" if 230 <= h <= 290 and Cc > 0.04 else ""
    print(f"  {k:12s} {v['color']}  h {h:4.0f}  C {Cc:.3f}  {wcag(v['color'], gnd):5.2f}:1{flag}")
print("\nNight profile arithmetic: text luminance needed for 7:1 and 11:1, and the best ratio under a 0.45 cap")
for y in (0.004, 0.008, 0.012):
    print(f"  ground {y}: 7:1 needs {7 * (y + 0.05) - 0.05:.3f}, 11:1 needs {11 * (y + 0.05) - 0.05:.3f}, cap 0.45 allows {(0.45 + 0.05) / (y + 0.05):.2f}:1")
print("  sRGB grey equivalents of luminance 0.004 and 0.012:", [round(255 * (1.055 * y ** (1 / 2.4) - 0.055)) for y in (0.004, 0.012)])
