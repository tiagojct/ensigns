# Glauca - print specification

Generated from glauca.json. These CMYK values are uncalibrated starting points from a naive separation. Proof against a physical swatch before a print run; the printer's RIP and ICC profile are authoritative. #007AFF sits outside coated CMYK -- expect a duller press blue or run it as a spot.

## Colour management
Profile: PSO Coated v3 (FOGRA51) for coated stock; FOGRA39 where v3 is unavailable.
Ink limit: 300% total area coverage (FOGRA51). Keep the dark saxum and rich black under it.

## Rich black
C70 M50 Y40 K100. Cool rich black that reads like pix. Use plain K for text below ~24 pt to avoid registration fringing.

## CMYK starting values
| token | CMYK |
| --- | --- |
| pix | C43 M21 Y0 K89 |
| pruina | C4 M2 Y0 K5 |
| dies | C100 M52 Y0 K0 |
| aer | C58 M30 Y0 K0 |
| imum | C95 M50 Y0 K41 |
| tint-deep | C65 M24 Y0 K75 |
| tint | C50 M19 Y0 K58 |
| tint-bright | C53 M17 Y0 K48 |
| tint-pale | C14 M4 Y0 K16 |
| paper | C2 M1 Y0 K4 |
| ink | C48 M19 Y0 K84 |
| light-accent | C95 M53 Y0 K19 |
| folium | C47 M0 Y62 K27 |

## Gamut risks
These desaturate in process; proof them or run as spot: dies (#007AFF), aer, folium (#62BA46), data-viz blue #0072B2, data-viz green #009E73.

If the brand blue must match exactly, run it as a process-blue spot (Pantone 2175 C region) and confirm on a swatch book; the naive separation above will print duller.

## Geometry
Bleed: 3 mm. Safe margin: 5 mm from trim.

- A3: 297x420 mm (trim)
- A2: 420x594 mm (trim)
- A1: 594x841 mm (trim)
- A0: 841x1189 mm (trim)
