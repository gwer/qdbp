## Cómo usarlo

Pega el JSON y se formatea con sangría al instante. Si tiene un error, verás la línea y la columna exactas. Modos:

- **Sangría de 2 o 4 espacios, tabulaciones**: para leerlo y pegarlo en el código;
- **Ordenar claves**: las claves de los objetos por orden alfabético en todos los niveles, útil para comparar dos JSON;
- **Minificar**: todo en una línea sin espacios sobrantes, para API y archivos de configuración.

«Reparar» arregla el «casi JSON» —configuraciones, objetos de JavaScript, salida de Python—: quita comentarios y comas finales, cambia comillas simples por dobles, pone comillas a las claves y convierte True/False/None en true/false/null. El resultado es JSON estricto y formateado.

Los datos se procesan en el navegador y no se envían a ninguna parte, así que puedes revisar JSON con tokens o datos personales.

## Errores frecuentes en JSON

- **Comillas simples:** `{'a': 1}`; en JSON las cadenas y las claves van entre comillas dobles.
- **Coma final:** `[1, 2,]` no está permitido en JSON (en JavaScript sí).
- **Claves sin comillas:** `{a: 1}` es JavaScript, no JSON.
- **Comentarios** `//` y `/* */`: el JSON estándar no los admite.
- **Ceros a la izquierda** como `01`, `NaN` y `undefined`: valores no válidos.

## Preguntas frecuentes

**¿Por qué `ñ` no se convierte en `\u00f1`?** JSON permite escribir este carácter directamente; la secuencia de escape Unicode es opcional.

**¿Hay límite de tamaño?** La capacidad de procesamiento depende de la memoria disponible y del rendimiento de tu dispositivo. Los documentos grandes pueden tardar más.

**¿Pueden cambiar los números?** Los enteros muy grandes y los decimales con muchas cifras, sí: el navegador guarda los números de JSON con unas 15–17 cifras significativas. Por ejemplo, `9007199254740993` se convierte en `9007199254740992`. Si tus datos tienen ID o importes así, guárdalos como cadenas.

Para codificar el JSON en una URL o en Base64, usa la [codificación URL](/es/security/url-encode/) o [Base64](/es/security/base64/).
