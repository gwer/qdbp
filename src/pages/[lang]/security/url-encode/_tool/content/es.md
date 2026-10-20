## Para qué codificar una URL

En una URL solo se admiten letras latinas, cifras y algunos signos. Los espacios, la ñ, las tildes y `&`, `=`, `?`, `#` dentro de un parámetro deben escribirse como `%XX`: es la codificación por porcentaje. El navegador lo hace solo, pero si montas enlaces a mano, en código o en etiquetas UTM, tienes que codificar los valores tú.

## Cómo usarlo

Elige «Codificar» para convertir el texto a un formato seguro para URL, o «Decodificar» para volver legible un enlace lleno de `%XX`.

## Ejemplos

- `café & crème` → `caf%C3%A9%20%26%20cr%C3%A8me`
- `price%20%26%20size` → `price & size`

## Preguntas frecuentes

**¿Por qué el espacio a veces es `%20` y a veces `+`?** En las cadenas de consulta de formularios el espacio se escribe tradicionalmente como `+`; en el resto de la URL, como `%20`. Al decodificar, `+` se interpreta como espacio; al codificar se usa siempre `%20`, que funciona en todas partes.

**¿Se codifica la `/`?** En «Codificar», sí: se codifica como el valor de un parámetro (`encodeURIComponent`), así que `/`, `?`, `&` y `=` pasan a `%XX`. Para una URL entera, elige «Codificar URL completa» (`encodeURI`): se mantienen los caracteres propios de la URL y se codifican espacios, tildes y ñ.

Para datos de cualquier tipo, usa [Base64](/es/security/base64/).
