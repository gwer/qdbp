## Cómo se usa

Añade tus fotos HEIC: arrástralas, selecciónalas o pégalas desde el portapapeles. Con el primer archivo, el navegador carga una sola vez el decodificador HEIC (unos 0,5 MB); después los archivos se convierten uno tras otro. Descarga los JPG uno a uno o en un único ZIP.

El tamaño en píxeles no cambia y se aplica la rotación de la foto. La calidad por defecto es del 90 %: a simple vista apenas se distingue del original. Si necesitas PNG (sin pérdida) o WebP, elígelo en la lista.

Las fotos se procesan en tu navegador y no se suben a ningún sitio.

## Por qué el iPhone hace fotos en HEIC

Desde iOS 11, la cámara del iPhone guarda las fotos en HEIC por defecto: el formato HEIF con compresión HEVC (H.265). Con la misma calidad, el archivo ocupa bastante menos que un JPG, así que caben más fotos en el teléfono. Pero Windows sin extensiones adicionales, muchas webs, servicios de correo y programas antiguos no abren HEIC; por eso hace falta convertirlas.

## Cómo hacer que el iPhone guarde las fotos en JPG

- **Ajustes → Cámara → Formatos → «Más compatible».** Las fotos nuevas se guardarán en JPG (y los vídeos, en H.264). Las que ya tienes seguirán en HEIC.
- **Ajustes → Fotos → «Transferir a Mac o PC» → «Automático».** Al copiar las fotos al ordenador por cable, el iPhone las convierte a JPG, y en el teléfono se quedan en HEIC.

## Preguntas frecuentes

**¿Se conservan la fecha y la ubicación?** No. Los metadatos EXIF (modelo del teléfono, fecha, coordenadas GPS) no pasan al nuevo archivo. Es útil si vas a publicar la foto. Para ver qué guarda una foto, usa el [visor EXIF](/es/images/exif/).

**¿La foto saldrá girada?** No. El iPhone guarda la rotación aparte de la imagen; el convertidor la aplica y el JPG sale en la orientación correcta.

**¿Y las Live Photos y las ráfagas?** Se convierte la foto principal. El vídeo de la Live Photo es un archivo .MOV aparte y no interviene. Si un HEIC contiene varias imágenes, se usa la marcada como principal.

**¿Por qué el JPG puede pesar más que el HEIC original?** HEIC comprime mejor, así que con calidad alta el JPG suele salir más grande. Para reducir el peso, baja la calidad al 80–85 % o pasa los JPG por el [compresor de imágenes](/es/images/compress-image/).

**¿Hay límites?** Hasta 50 MB por archivo y 100 megapíxeles por imagen; las fotos de 48 MP del iPhone Pro pasan sin problema. Si un archivo no es HEIC, está dañado o al navegador le falta memoria, ese archivo muestra un aviso y los demás se convierten igual.

**¿Cómo abrir HEIC en Windows sin convertirlo?** En Windows 10 y 11, instala desde Microsoft Store las «Extensiones de imagen HEIF» y las «Extensiones de vídeo HEVC». Si solo necesitas enviar o publicar la foto, es más rápido convertirla aquí a JPG.

Para JPG, PNG y WebP, usa el [conversor de imágenes](/es/images/convert-image/).

El decodificador HEIC se basa en las bibliotecas libres libheif y libde265, con licencia LGPL-3.0: [licencia y código fuente](/licenses/libheif.txt).
