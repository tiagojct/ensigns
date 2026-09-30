#!/usr/bin/env python3
"""Bachelor: how far each flag moves when it goes to CMYK and back.

The posters of the family are printed, and most CMYK presses cannot hold the saturated greens, cyans and
blues that a screen can. This script converts each flag from sRGB to CMYK and back through an ICC profile
with littleCMS (Pillow's ImageCms), using relative colorimetric intent with black point compensation,
and measures the distance between the flag and what comes back, in OKLab. It lists the flags that move
by more than a threshold.

The flags are read from the token file, resolved through the palette here. No colour is typed in this
script. The grey ramp at the end is computed, and it measures the profile's own round trip error on
colours that are certainly inside its gamut.

The profile is a stand-in. The only CMYK profile on the machine that wrote the family is the macOS
Generic CMYK profile, which is not a press standard such as FOGRA39, SWOP or GRACoL, and ICC files are
not downloaded. Run the script again with the profile the printer names:

    python scripts/design/bachelor-gamut.py --profile path/to/profile.icc

The script exits 0 in every case. It prints "not tested" and the reason when Pillow, littleCMS or the
profile is missing.
"""

import argparse
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOKENS = ROOT / "families" / "bachelor" / "bachelor.tokens.json"
DEFAULT_PROFILE = Path("/System/Library/ColorSync/Profiles/Generic CMYK Profile.icc")

# A flag that moves by more than this is listed. 0.02 is the just noticeable difference in OKLab that
# CSS Color Module Level 4 uses for gamut mapping, and lib/colour/oklab.ts uses the same value. The
# round trip error of the profile on its own greys is well under it (see the noise floor below).
THRESHOLD = 0.02
# A flag that moves by more than this has changed colour, not shade: three times the threshold.
LARGE = 0.06


def not_tested(reason):
    print(f"not tested: {reason}")
    sys.exit(0)


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--profile", type=Path, default=DEFAULT_PROFILE, help="CMYK ICC profile (default: macOS Generic CMYK)")
    parser.add_argument("--tokens", type=Path, default=TOKENS, help="token file to read the flags from")
    return parser.parse_args()


# OKLab, after Ottosson (2020). Standard matrices; the script needs no other colour code.
def _linear(channel):
    c = channel / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def oklab(rgb):
    r, g, b = (_linear(c) for c in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def distance(a, b):
    return math.dist(oklab(a), oklab(b))


def hex_to_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#" + "".join(f"{v:02X}" for v in rgb)


def palette_hex(palette, ref):
    """The hex value a {palette.group.name} reference points at."""
    group, name = ref.strip("{}").split(".")[1:]
    entry = palette[group][name]
    if isinstance(entry, str):
        return entry
    if "hex" in entry:
        return entry["hex"]
    return palette_hex(palette, entry["ref"])


def read_flags(path):
    """Each flag as (mode, name, hex), one entry when both modes give it the same colour."""
    data = json.loads(path.read_text(encoding="utf-8"))
    flags = {}
    for mode, block in data["modes"].items():
        for name, ref in block.get("accents", {}).items():
            flags.setdefault(name, {})[mode] = palette_hex(data["palette"], ref)
    out = []
    for name, by_mode in flags.items():
        if len(set(by_mode.values())) == 1:
            out.append(("both modes", name, next(iter(by_mode.values()))))
        else:
            out.extend((mode, name, hexv) for mode, hexv in by_mode.items())
    return out


def main():
    args = parse_args()
    try:
        from PIL import Image, ImageCms, features
    except ImportError:
        not_tested("Pillow is not installed")
    if not features.check("littlecms2"):
        not_tested("this Pillow was built without littleCMS")
    if not args.profile.exists():
        not_tested(f"the profile {args.profile} does not exist")
    if not args.tokens.exists():
        not_tested(f"the token file {args.tokens} does not exist")

    srgb = ImageCms.createProfile("sRGB")
    cmyk = ImageCms.getOpenProfile(str(args.profile))
    intent = ImageCms.Intent.RELATIVE_COLORIMETRIC
    flags = ImageCms.Flags.BLACKPOINTCOMPENSATION
    to_cmyk = ImageCms.buildTransform(srgb, cmyk, "RGB", "CMYK", intent, flags)
    to_rgb = ImageCms.buildTransform(cmyk, srgb, "CMYK", "RGB", intent, flags)

    def round_trip(rgb):
        image = Image.new("RGB", (1, 1), rgb)
        ink = ImageCms.applyTransform(image, to_cmyk)
        back = ImageCms.applyTransform(ink, to_rgb).getpixel((0, 0))
        percent = tuple(round(v / 255 * 100) for v in ink.getpixel((0, 0)))
        return percent, back

    print(f"Profile: {args.profile.name} ({ImageCms.getProfileDescription(cmyk).strip()})")
    print(f"Pillow {Image.__version__}, littleCMS {features.version('littlecms2')}, relative colorimetric with black point compensation")
    print(f"Distance is OKLab, sRGB to CMYK and back. Listed above {THRESHOLD}; a large move is above {LARGE}.\n")

    # The noise floor: greys of 10 to 90 per cent, which every CMYK profile reproduces.
    greys = [round(255 * k / 10) for k in range(1, 10)]
    floor = max(distance((g, g, g), round_trip((g, g, g))[1]) for g in greys)
    print(f"Noise floor: the largest round trip error on nine greys is {floor:.3f}.\n")

    print("flag       mode        screen   CMYK per cent    back     moves")
    moved = []
    for mode, name, hexv in read_flags(args.tokens):
        rgb = hex_to_rgb(hexv)
        percent, back = round_trip(rgb)
        d = distance(rgb, back)
        mark = "large" if d > LARGE else "listed" if d > THRESHOLD else ""
        if d > THRESHOLD:
            moved.append((d, name))
        print(f"{name:10} {mode:11} {hexv}  {str(list(percent)):15}  {rgb_to_hex(back)}  {d:.3f}  {mark}")

    flagged = sorted(moved, reverse=True)
    print()
    if flagged:
        print(f"{len(flagged)} of the flags move by more than {THRESHOLD}: " + ", ".join(f"{n} {d:.3f}" for d, n in flagged) + ".")
        large = [n for d, n in flagged if d > LARGE]
        print(f"{len(large)} move by more than {LARGE}: " + (", ".join(large) if large else "none") + ".")
    else:
        print(f"No flag moves by more than {THRESHOLD}.")
    print("The profile is a stand-in for a press profile. Repeat the check with the printer's own profile (--profile) before any value is tuned.")


if __name__ == "__main__":
    main()
