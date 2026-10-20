## So funktioniert's

Farbe in einem beliebigen Format eingeben – `#3451d1`, `rgb(52 81 209)`, `hsl(229 63% 51%)` oder `oklch(51% 0.2 268)` – oder in der Palette wählen. Sie sehen dieselbe Farbe in allen Formaten und wie gut sie auf Weiß und Schwarz lesbar ist.

## Formate

- **HEX** – Standard in Web und Design, auch mit Transparenz: `#3451d180`.
- **RGB** – Rot, Grün und Blau von 0 bis 255.
- **HSL und HSV** – Farbton (0–360°), Sättigung und Helligkeit: praktisch zum Abstimmen von Nuancen.
- **CMYK** – für den Druck. Die Umrechnung ist vereinfacht und ohne Farbprofil; für die Produktion das Profil der Druckerei verwenden.
- **OKLCH** – modernes CSS-Format, dessen Helligkeit der menschlichen Wahrnehmung entspricht; Paletten werden gleichmäßiger.

## Kontrast nach WCAG

Barrierefreier Text muss sich deutlich vom Hintergrund abheben. WCAG 2.x verlangt:

- **4,5:1** – Minimum für normalen Text (Stufe AA);
- **3:1** – für großen Text (24 px oder 19 px fett);
- **7:1** – erhöhte Stufe AAA.

Um den Kontrast auf einem eigenen Hintergrund zu prüfen (etwa Text auf einem farbigen Banner), geben Sie die Hintergrundfarbe im Feld unter den Prüfungen ein oder wählen Sie sie aus.

Beispiel: `#777777` auf Weiß ergibt 4,48:1 – knapp unter dem AA-Minimum für normalen Text.

## Häufige Fragen

**Warum ändert sich eine OKLCH-Farbe manchmal beim Umrechnen in HEX?** Manche OKLCH-Farben liegen außerhalb des sRGB-Farbraums und werden auf die nächste darstellbare Farbe abgebildet.
