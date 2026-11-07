## Cómo usarlo

Elige un PDF, el método y el nivel de compresión, y pulsa «Comprimir PDF». Junto al resultado verás cuánto pesaba el archivo y cuánto pesa ahora. Si no se ha podido reducir, se descarga el original: la herramienta nunca te da un archivo más grande.

**Comprimir imágenes** es el método principal. Casi todo el peso de un PDF suelen ser fotos y escaneos. Se reducen a la resolución elegida y se guardan de nuevo en JPG. El texto, las fuentes, los enlaces, los marcadores y los campos de formulario no cambian.

**Como escaneo** convierte cada página en una sola imagen JPG. Es el método de reserva para cuando comprimir las imágenes apenas sirvió. Ayuda si el peso viene de imágenes en formatos que el método principal no toca (JPEG 2000, CMYK, con paleta), de planos, diagramas y mapas complejos o de fuentes incrustadas grandes. Un escaneo normal hecho con fotos de las páginas también lo reduce el método principal, y conserva el texto reconocido del escaneo. «Como escaneo» elimina el texto: no se puede seleccionar, copiar ni buscar. Un documento que es sobre todo texto pesa más como imágenes que ahora; en ese caso se descargará el archivo original.

El nivel de compresión fija la resolución de las imágenes:

- **200 dpi**: calidad casi como la del original, apta para imprimir.
- **150 dpi**: buen equilibrio. El texto de los escaneos se lee bien y las fotos se ven bien en pantalla e impresas.
- **100 dpi**: el archivo más pequeño. La letra pequeña de los escaneos puede leerse peor.

## Cómo funciona

El límite de resolución se calcula a partir del tamaño de la página: por ejemplo, en A4 a 150 dpi una imagen se reduce a 1754 píxeles por el lado largo. Las imágenes que ya son más pequeñas solo se vuelven a guardar en JPG. La nueva versión sustituye a la anterior solo si pesa al menos un 10 % menos.

Además, se eliminan sin pérdida los objetos que quedaron en el archivo tras ediciones anteriores y ya no se usan. Los datos internos sin comprimir se comprimen.

Se recomprimen las fotos JPG y las imágenes normales en color y en escala de grises. Las imágenes en JPEG 2000, JBIG2, CMYK o con paleta se quedan como están. Los escaneos en blanco y negro en JBIG2 y CCITT ya pesan muy poco.

Todo ocurre en tu navegador: el archivo no se sube a ningún servidor. Un PDF protegido con contraseña se abre después de escribirla, y el archivo comprimido se guarda sin contraseña.

## Preguntas frecuentes

**¿Por qué el archivo apenas ha bajado?** Probablemente tiene pocas imágenes: el texto y los gráficos vectoriales pesan poco y ya están comprimidos. A veces el peso viene de las fuentes incrustadas, que no se pueden reducir sin pérdidas.

**¿Cómo lo dejo por debajo de un límite, por ejemplo 2 MB?** Empieza por el nivel medio. Si el archivo sigue superando el límite, elige el alto. Si tampoco basta, prueba el método «Como escaneo»: vuelve a dibujar las páginas como imágenes. Otra opción es [dividir el PDF](/es/pdf/split-pdf/) en varias partes.

**¿Qué es mejor: comprimir el PDF o las fotos antes de crearlo?** Si el PDF se hace con fotos, es más cómodo [comprimirlas](/es/images/compress-image/) antes. El [convertidor de JPG a PDF](/es/pdf/jpg-to-pdf/) las incrusta sin volver a comprimirlas.
