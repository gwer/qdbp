## How to use

Enter a color in any format — `#3451d1`, `rgb(52 81 209)`, `hsl(229 63% 51%)` or `oklch(51% 0.2 268)` — or pick one. You'll see the same color in every format and how readable it is on white and black.

## Formats

- **HEX** — the web and design standard; alpha is supported: `#3451d180`.
- **RGB** — red, green and blue from 0 to 255.
- **HSL and HSV** — hue (0–360°), saturation and lightness (or value): handy for tweaking shades.
- **CMYK** — for print. The conversion here is a simple one without a color profile; use your printer's profile for production.
- **OKLCH** — a modern CSS format whose lightness matches human perception, so palettes come out more even.

## WCAG contrast

For accessible text, foreground and background must differ enough. WCAG 2.x requires:

- **4.5:1** — minimum for normal text (level AA);
- **3:1** — for large text (24 px, or 19 px bold);
- **7:1** — enhanced level AAA.

For example, `#777777` on white is 4.48:1 — just short of the AA minimum for normal text.

## FAQ

**Why does an OKLCH color sometimes change when converted to HEX?** Some OKLCH colors fall outside the sRGB gamut; they're mapped to the nearest displayable color.
