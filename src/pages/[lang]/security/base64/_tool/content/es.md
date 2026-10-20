## Qué es Base64

Base64 es una forma de escribir cualquier dato (texto, una imagen, un archivo) usando solo letras latinas, cifras y los signos `+`, `/` y `=`. Se usa donde solo se admite texto: correos, JSON, data URL o cabeceras HTTP como `Authorization: Basic`.

Base64 es **codificación, no cifrado**: cualquiera puede decodificarlo sin contraseña.

## Cómo usarlo

Elige «Codificar» o «Decodificar» y pega el texto: el resultado aparece al instante. El texto se codifica en UTF-8, así que las tildes, la ñ y los emojis funcionan bien. Al decodificar también se acepta la variante URL-safe (`-` y `_` en lugar de `+` y `/`) y las cadenas sin `=` al final. Para URL, JWT y nombres de archivo está «Codificar (URL-safe)»: `-` y `_` en lugar de `+` y `/`, sin `=` al final.

## Ejemplos

- `hola, mundo` → `aG9sYSwgbXVuZG8=`
- `aGVsbG8=` → `hello`

## Preguntas frecuentes

**¿Por qué la cadena codificada es más larga?** Cada 3 bytes se convierten en 4 caracteres, así que el tamaño crece alrededor de un tercio.

**¿Qué significan los `=` del final?** Son relleno: con relleno, la longitud es múltiplo de 4. Esta herramienta también acepta cadenas sin los signos `=` finales.

**¿Por qué da error al decodificar?** La cadena tiene caracteres no válidos o lo que contiene no es texto (por ejemplo, una imagen).

Para enlaces, usa la [codificación URL](/es/security/url-encode/).
