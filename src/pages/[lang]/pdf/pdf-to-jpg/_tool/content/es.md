## Cómo usarlo

Elige un PDF y aparecerán las miniaturas de las páginas. Después ajusta:

- **Formato**: JPG va bien para fotos, escaneos y para enviar por mensajería. PNG, para esquemas, tablas y texto: no tiene pérdidas y los bordes de las letras quedan nítidos, pero los archivos pesan más.
- **Resolución**: 72 dpi bastan para ver la página en pantalla o meterla en una presentación. 150 dpi es la opción universal. 300 dpi hacen falta para imprimir y para letra pequeña. Una página A4 a 150 dpi mide 1240×1754 píxeles; a 300 dpi, 2480×3508.
- **Páginas**: si el campo está vacío, se guardan todas. Puedes indicar páginas sueltas y rangos: `1-3, 7`. Las páginas que no entran en el resultado aparecen atenuadas en las miniaturas.

Pulsa «Guardar» y descarga las imágenes una a una o todas juntas en un ZIP. El nombre de cada archivo lleva el número de página.

## Cómo funciona

Cada página se dibuja en el navegador con el mismo motor que usa Firefox (pdf.js) y se guarda como imagen. El archivo no se sube a ningún servidor. Un PDF protegido con contraseña se abre después de escribirla.

El tamaño de la imagen en píxeles es el tamaño de la página en pulgadas multiplicado por la resolución. Las páginas muy grandes, por ejemplo planos A1 a 300 dpi, superan el límite que los navegadores de móvil admiten para una sola imagen (unos 16,7 megapíxeles). Esas páginas se guardan con menos resolución, y junto al archivo se indica.

## Preguntas frecuentes

**¿Puedo sacar del PDF las fotos originales y no capturas de las páginas?** Esta herramienta guarda la página entera tal como se ve. Si la foto ocupa toda la página, como en un escaneo, el resultado es prácticamente el mismo. Para tener la foto sin márgenes, elige una resolución más alta y recorta la imagen.

**¿Por qué el texto de la imagen sale borroso?** Seguramente la resolución es demasiado baja para una letra pequeña. Elige 300 dpi y el formato PNG.

**¿Y al revés, un PDF a partir de imágenes?** Para eso está el [convertidor de JPG a PDF](/es/pdf/jpg-to-pdf/).

**¿Solo necesitas el texto del PDF?** Puedes [extraerlo](/es/pdf/pdf-to-text/) como texto normal, sin imágenes.
