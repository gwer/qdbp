## Cómo usarlo

Escribe un color en cualquier formato —`#3451d1`, `rgb(52 81 209)`, `hsl(229 63% 51%)` u `oklch(51% 0.2 268)`— o elígelo en la paleta. Verás el mismo color en todos los formatos y lo bien que se lee sobre blanco y sobre negro.

## Formatos

- **HEX**: el estándar web y de diseño; admite transparencia: `#3451d180`.
- **RGB**: rojo, verde y azul de 0 a 255.
- **HSL y HSV**: tono (0–360°), saturación y luminosidad (o brillo); prácticos para ajustar matices.
- **CMYK**: para imprenta. La conversión es simplificada, sin perfil de color; para producción usa el perfil de tu imprenta.
- **OKLCH**: formato CSS moderno cuya luminosidad corresponde a la percepción humana, así que las paletas quedan más uniformes.

## Contraste WCAG

Para que un texto sea accesible, debe distinguirse bien del fondo. Según WCAG 2.x:

- **4,5:1**: mínimo para texto normal (nivel AA);
- **3:1**: para texto grande (24 px, o 19 px en negrita);
- **7:1**: nivel reforzado AAA.

Para comprobar el contraste sobre tu propio fondo (por ejemplo, texto en un banner de color), escribe el color del fondo en el campo bajo las comprobaciones o elígelo.

Por ejemplo, `#777777` sobre blanco da 4,48:1, justo por debajo del mínimo AA para texto normal.

## Preguntas frecuentes

**¿Por qué un color OKLCH cambia a veces al pasarlo a HEX?** Algunos colores OKLCH quedan fuera de la gama sRGB y se ajustan al color visible más cercano.
