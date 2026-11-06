## Cómo se usa

Elige el algoritmo, escribe los datos del token (payload) en JSON y el secreto: el token aparece abajo, listo para copiar. La cabecera se genera sola: `{"alg":"HS256","typ":"JWT"}` con el algoritmo elegido.

El token se crea en tu navegador; el secreto y los datos no se envían a ningún sitio. El ejemplo que se abre por defecto es el mismo token que en el [decodificador JWT](/es/dev/jwt-decoder/), donde también puedes comprobar la firma del token que generes.

Solo se firma con secreto compartido (HS256, HS384, HS512). Las firmas RS y ES con clave privada no se generan aquí.

## El secreto

El secreto se usa como texto en UTF-8, que es como lo interpretan la mayoría de las librerías cuando se da como cadena. Si tu servicio guarda el secreto en Base64 o hex, la firma con esa cadena no coincidirá: el servicio firma con los bytes decodificados.

El RFC 7518 exige una clave al menos tan larga como la salida del hash: 32 bytes para HS256, 48 para HS384 y 64 para HS512. Si el secreto es más corto, verás un aviso. Una letra sin tilde ocupa 1 byte; la ñ y las vocales con tilde, 2. Para un secreto largo y aleatorio, usa el [generador de contraseñas](/es/security/password-generator/).

## Cómo se forma el token

1. La cabecera y el payload se escriben en JSON sin espacios y se codifican en Base64URL (Base64 con `+` y `/` cambiados por `-` y `_`, y sin los `=` finales).
2. Las dos partes se unen con un punto y de esa cadena se calcula un HMAC con el hash elegido (SHA-256, SHA-384 o SHA-512) y el secreto.
3. La firma en Base64URL se añade como tercera parte: `cabecera.payload.firma`.

El ejemplo de jwt.io: algoritmo HS256, payload `{"sub":"1234567890","name":"John Doe","iat":1516239022}`, secreto `your-256-bit-secret`. El resultado es

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

El secreto de este ejemplo tiene 19 bytes, así que verás un aviso de que es corto para HS256.

## Preguntas frecuentes

**¿Cómo pongo una caducidad?** Con `exp` (caduca), `nbf` (válido desde) e `iat` (emitido), en segundos Unix, no en milisegundos. Para pasar una fecha a segundos, usa el [conversor de Unix timestamp](/es/dev/unix-timestamp/).

**¿El payload va cifrado?** No, solo codificado: cualquiera que tenga el token puede leerlo. No metas contraseñas ni datos personales en un token: la firma protege contra la falsificación, no contra la lectura.

**¿Por qué mi token no coincide con el de mi servidor con los mismos datos?** La firma depende de cada byte: el orden de los campos, los espacios del JSON, campos extra de la cabecera como `kid`. Esta herramienta escribe el JSON sin espacios y mantiene los campos en el orden en que los escribiste. El servidor comprueba la firma sobre el propio token, así que lo aceptará igualmente si el secreto y el algoritmo coinciden.

**Los números grandes cambian.** El navegador no guarda con exactitud enteros mayores que 9.007.199.254.740.991: escribe esos valores en el payload como cadenas.
