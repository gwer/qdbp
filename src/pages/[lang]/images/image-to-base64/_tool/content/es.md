## Cómo usarlo

**Imagen → Base64.** Añade una imagen y obtenla como data URL, Base64 «a secas», una regla CSS lista o una etiqueta `<img>`. Copia el resultado y pégalo en tu código.

**Base64 → imagen.** Pega un data URL o una cadena Base64: la imagen aparece al instante y puedes descargarla. El formato se detecta por el contenido, aunque la cabecera diga otra cosa.

Todo funciona en tu navegador; el archivo no se sube a ningún sitio.

## Ejemplo

Un PNG transparente de 1 × 1 píxel pesa 70 bytes y como data URL se ve así:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==`

## Para qué sirve

- Iconos e imágenes pequeñas directamente en CSS o HTML, sin una petición más al servidor.
- Imágenes dentro de JSON, correos y plantillas donde no se puede adjuntar un archivo.
- Depuración: ver qué imagen esconde una cadena Base64 de una API o una base de datos.

## Preguntas frecuentes

**¿Por qué Base64 pesa más que el archivo?** Cada 3 bytes se convierten en 4 caracteres, así que el tamaño crece alrededor de un tercio.

**¿Conviene incrustar así fotos grandes?** No: la página pesa más y el navegador no puede guardar la imagen en caché por separado. Los data URL van bien para archivos de pocos kilobytes. Las imágenes grandes es mejor [comprimirlas](/es/images/compress-image/) y enlazarlas normalmente.

**¿Base64 es un cifrado?** No, es solo otra forma de escribir los mismos datos y cualquiera puede decodificarla. Para texto, usa la [codificación Base64](/es/security/base64/).
