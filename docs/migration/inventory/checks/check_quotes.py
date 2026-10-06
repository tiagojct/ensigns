#!/usr/bin/env python3
"""Check the Moby-Dick quotations named in the Ensigns brief against Gutenberg eBook 2701.

Usage:
    python3 check_quotes.py [path/to/moby-dick.txt]

The path defaults to the MOBY_TEXT environment variable, then to sources/moby-dick.txt.

Two comparisons are made for every phrase:
    exact       whitespace collapsed, nothing else changed
    normalised  whitespace collapsed, Gutenberg italic underscores removed,
                curly quotation marks and apostrophes replaced by straight ones

The phase 2 quote test should use the normalised comparison. Read-only.
"""
import os
import re
import sys

path = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("MOBY_TEXT", "sources/moby-dick.txt")
raw = open(path, encoding="utf-8").read()
body = raw[raw.index("*** START OF THE PROJECT GUTENBERG EBOOK"): raw.index("*** END OF THE PROJECT GUTENBERG EBOOK")]


def collapse(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def normalise(s: str) -> str:
    s = s.replace("_", "")
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"')):
        s = s.replace(a, b)
    return collapse(s)


flat_exact = collapse(body)
flat_norm = normalise(body)

print("Chapter headings (first line of the real heading, after the table of contents)")
heads = {}
for m in re.finditer(r"^CHAPTER (\d+)\.\s*(.*?)\s*$", body, flags=re.M):
    heads.setdefault(int(m.group(1)), []).append(m.group(2))
for n in (52, 53, 54, 71, 81, 91, 92, 96, 100, 101, 115, 128, 131):
    print(f"  {n:>3}  {heads.get(n, ['MISSING'])[-1]}")
print("  Epilogue heading present:", bool(re.search(r"^Epilogue\s*$", body, flags=re.M)))

PHRASES = [
    ("ch52 skeleton of a stranded walrus", "bleached like the skeleton of a stranded walrus"),
    ("ch52 hoarfrost (spelling in the brief)", "furred over with hoarfrost"),
    ("ch52 hoar-frost (spelling in the text)", "furred over with hoar-frost"),
    ("ch52 the Goney (Albatross) by name", "the Goney (Albatross) by name"),
    ("ch53 definition of a gam", "A social meeting of two (or more) Whaleships, generally on a cruising-ground; when, after exchanging hails, they exchange visits by boats' crews: the two captains remaining, for the time, on board of one ship, and the two chief mates on the other."),
    ("ch71 malignant epidemic", "the Jeroboam had a malignant epidemic on board"),
    ("ch81 a clean one", "a clean one (that is, an empty one)"),
    ("ch96 face of the fire", "Look not too long in the face of the fire"),
    ("ch115 ensigns and jacks (colours)", "Signals, ensigns, and jacks of all colours were flying from her rigging, on every side."),
    ("ch115 ensigns and jacks (colors)", "Signals, ensigns, and jacks of all colors were flying from her rigging, on every side."),
    ("epilogue Rachel", "It was the devious-cruising Rachel, that in her retracing search after her missing children, only found another orphan."),
    ("ch131 misnamed the Delight", "most miserably misnamed the Delight"),
]

print()
print(f"{'phrase':45s} {'exact':>7s} {'normalised':>11s}")
for label, phrase in PHRASES:
    e = "yes" if collapse(phrase) in flat_exact else "no"
    n = "yes" if normalise(phrase) in flat_norm else "no"
    print(f"{label:45s} {e:>7s} {n:>11s}")
