#!/usr/bin/env python3
"""Validate glauca.json: structure, valid hex, mode parity, and WCAG contrast.
Exits 1 on any failure. This is what makes the accessibility guarantee a test, not a claim."""
import json, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
D = json.loads((ROOT / "glauca.json").read_text())
errors = []
HEX = re.compile(r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")

def err(m): errors.append(m)

# 1. required top-level keys
for k in ["version", "signature", "modes", "palette", "code", "terminal", "type", "spacing", "accessibility"]:
    if k not in D: err("missing top-level key: %s" % k)

# 2. modes present, parity, scheme
dark, light = D["modes"].get("dark", {}), D["modes"].get("light", {})
lk = {k for k in dark if k not in ("label", "scheme")}
ck = {k for k in light if k not in ("label", "scheme")}
if lk != ck: err("dark/light token keys differ: %s" % (lk ^ ck))
if dark.get("scheme") != "dark":  err("dark.scheme must be 'dark'")
if light.get("scheme") != "light": err("light.scheme must be 'light'")

# 3. every colour-looking value is valid hex
def walk(obj, path):
    if isinstance(obj, str):
        if obj.startswith("#") and not HEX.match(obj): err("bad hex at %s: %s" % (path, obj))
    elif isinstance(obj, dict):
        for k, v in obj.items(): walk(v, path + "." + str(k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj): walk(v, "%s[%d]" % (path, i))
for sec in ["modes", "palette", "code", "terminal"]:
    walk(D[sec], sec)

# 3b. typography roles
tg = D.get("typography", {})
roles = tg.get("roles", {}); meas = tg.get("measure", {})
fontkeys = set(tg.get("fonts", {}).keys())
serif_opsz = tg.get("fonts", {}).get("serif", {}).get("axes", {}).get("opsz", [9, 144])
for name, r in roles.items():
    if r.get("font") not in fontkeys: err("role %s: font %r not in typography.fonts" % (name, r.get("font")))
    if "size" not in r and "fluid" not in r: err("role %s: needs size or fluid" % name)
    if not isinstance(r.get("leading"), (int, float)): err("role %s: leading must be numeric" % name)
    if r.get("measure") and r["measure"] not in meas: err("role %s: measure %r undefined" % (name, r["measure"]))
    if r.get("font") == "serif" and "opsz" in r and not (serif_opsz[0] <= r["opsz"] <= serif_opsz[1]):
        err("role %s: opsz %s outside the serif's range %s" % (name, r["opsz"], serif_opsz))

# 3c. dataviz scales
import re as _re
dv = D.get("dataviz", {})
for key in ("categorical", "sequential", "diverging"):
    sc = dv.get(key, {}).get("colors", [])
    if not sc: err("dataviz.%s: no colors" % key)
    for c in sc:
        if not _re.fullmatch(r"#[0-9A-Fa-f]{6}", c): err("dataviz.%s: bad hex %r" % (key, c))
if dv and "plot" in dv:
    for m in ("light", "dark"):
        if m not in dv["plot"]: err("dataviz.plot: missing %s" % m)

# 4. WCAG contrast
def lin(c):
    c /= 255; return c/12.92 if c <= 0.03928 else ((c+0.055)/1.055)**2.4
def lum(h):
    h = h.lstrip("#"); r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4)); return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)
def ratio(f, b):
    a, c = lum(f), lum(b); hi, lo = max(a, c), min(a, c); return (hi+.05)/(lo+.05)

checks = [
 ("dark text/bg",       dark["text"], dark["bg"], 4.5),
 ("dark muted/bg",      dark["text-muted"], dark["bg"], 4.5),
 ("dark accent/bg",     dark["accent"], dark["bg"], 4.5),
 ("dark button",        dark["on-accent"], dark["accent"], 4.5),
 ("dark nebula/bg",     dark["tint-pale"], dark["bg"], 4.5),
 ("dark aer/tint (UI)", dark["accent-bright"], dark["tint"], 3.0),
 # Hover-state text: dark mode hovers brighten (accent-bright), light mode hovers must darken
 # (accent-deep) -- the raw #007AFF anchor measures under 4.5 on the pale bg, which is why light
 # keeps it for large/UI marks and hovers use accent-deep. Both hover pairs locked at the AA floor.
 ("dark hover/bg",       dark["accent-bright"], dark["bg"], 4.5),
 ("light hover/bg",      light["accent-deep"], light["bg"], 4.5),
 ("light ink/bg",       light["text"], light["bg"], 4.5),
 ("light muted/bg",     light["text-muted"], light["bg"], 4.5),
 ("light accent/bg",    light["accent"], light["bg"], 4.5),
 ("light button",       light["on-accent"], light["accent"], 4.5),
 ("light tint-bright/bg", light["tint-bright"], light["bg"], 4.5),
]
print("WCAG contrast:")
for label, f, b, mn in checks:
    r = ratio(f, b); ok = r >= mn
    print("  %-22s %5.2f  (need %.1f)  %s" % (label, r, mn, "ok" if ok else "FAIL"))
    if not ok: err("contrast %s = %.2f < %.1f" % (label, r, mn))

if errors:
    print("\nVALIDATION FAILED:"); [print("  - " + e) for e in errors]; sys.exit(1)
print("\nvalidation passed")
