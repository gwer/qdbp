## Qué es un UUID

Un UUID (también llamado GUID) es un identificador de 128 bits como `550e8400-e29b-41d4-a716-446655440000`. Se puede crear en cualquier sitio sin un contador central y la probabilidad de que dos coincidan es ínfima. Se usa como clave en bases de datos e identificador de pedidos, archivos o eventos.

## ¿v4 o v7?

- **v4**: totalmente aleatorio (122 bits aleatorios). Sirve casi siempre.
- **v7**: los primeros 48 bits son la hora de creación en milisegundos y el resto es aleatorio (RFC 9562, 2024). Se ordenan por fecha de creación, así que funcionan mejor como claves primarias: los índices crecen en orden.

## Cómo usarlo

Elige la versión y la cantidad: los UUID aparecen al instante. Puedes pasarlos a mayúsculas o quitar los guiones. Todo se genera en tu navegador con `crypto.getRandomValues`.

## Preguntas frecuentes

**¿Se puede repetir un UUID?** En teoría sí, en la práctica no: haría falta generar unos 2,7 trillones (2,7 × 10¹⁸) de UUID v4 para tener un 50 % de probabilidad de una sola coincidencia.

**¿En qué se diferencian UUID y GUID?** En nada: GUID es el nombre que usa Microsoft para el mismo formato.

**¿Se puede saber cuándo se creó un UUID v7?** Sí: las primeras 12 cifras hexadecimales son la hora en milisegundos desde el 1 de enero de 1970. Puedes convertirla con el [conversor de Unix timestamp](/es/dates/unix-timestamp/) en modo milisegundos.
