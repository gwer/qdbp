## Cómo usarlo

Pega el JSON y se formatea con sangría al instante. Si tiene un error, verás la línea y la columna exactas. Modos:

- **Sangría de 2 o 4 espacios, tabulaciones**: para leerlo y pegarlo en el código;
- **Ordenar claves**: las claves de los objetos por orden alfabético en todos los niveles, útil para comparar dos JSON;
- **Minificar**: todo en una línea sin espacios sobrantes, para API y archivos de configuración.

Los datos se procesan en el navegador y no se envían a ninguna parte, así que puedes revisar JSON con tokens o datos personales.

## Errores frecuentes en JSON

- **Comillas simples:** `{'a': 1}`; en JSON las cadenas y las claves van entre comillas dobles.
- **Coma final:** `[1, 2,]` no está permitido en JSON (en JavaScript sí).
- **Claves sin comillas:** `{a: 1}` es JavaScript, no JSON.
- **Comentarios** `//` y `/* */`: el JSON estándar no los admite.
- **Ceros a la izquierda** como `01`, `NaN` y `undefined`: valores no válidos.

## Preguntas frecuentes

**¿Por qué las tildes y la ñ no se convierten en `ñ`?** No hace falta escaparlas: JSON se escribe en UTF-8.

**¿Hay límite de tamaño?** Solo la memoria de tu dispositivo; archivos de varios megas se procesan en una fracción de segundo.

Para codificar el JSON en una URL o en Base64, usa la [codificación URL](/es/security/url-encode/) o [Base64](/es/security/base64/).
