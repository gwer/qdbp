## Cómo se usa

Pega el token en el campo, solo o con el prefijo `Authorization: Bearer …`; los saltos de línea no molestan. El decodificador muestra al instante:

- **la cabecera**: el algoritmo de firma (`alg`), el tipo (`typ`) y a veces el identificador de la clave (`kid`);
- **el payload**: todos los datos del token en JSON formateado;
- **las fechas `iat`, `nbf` y `exp`**: con fecha y hora en la zona horaria de tu dispositivo y en relación con el momento actual («dentro de 3 días», «hace 2 horas»);
- **el estado**: si el token ha caducado o sigue vigente;
- **la firma**: tal cual, como cadena Base64URL.

El token se decodifica en tu navegador y no se envía a ningún sitio, así que puedes revisar aquí tokens reales. Aun así, recuerda que un JWT filtrado es una llave válida al sistema hasta que caduca.

## La firma no se verifica

El decodificador muestra el contenido, pero no comprueba la firma: para eso hace falta la clave secreta o pública del servidor. El payload de un JWT normal no está cifrado, solo codificado en Base64URL: cualquiera puede leerlo, pero nadie puede falsificarlo sin la clave. Por eso:

- no guardes contraseñas ni datos personales en un token;
- no tomes decisiones con los datos del token hasta que el servidor haya verificado la firma;
- un token con `"alg": "none"` y la tercera parte vacía no tiene ninguna protección.

## Partes de un JWT

Un token son tres partes separadas por puntos: `cabecera.payload.firma`. Las dos primeras son JSON codificado en Base64URL (Base64 en el que `+` y `/` se sustituyen por `-` y `_` y se quitan los `=` del final). Este es el ejemplo del estándar RFC 7519:

`eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`

Su cabecera es `{"typ":"JWT","alg":"HS256"}` y su payload, `{"iss":"joe","exp":1300819380,"http://example.com/is_root":true}`. El valor de `exp`, 1300819380, corresponde al 22 de marzo de 2011 a las 18:43 UTC: el token caducó hace mucho.

## Claims estándar

| Campo | Significado |
|---|---|
| `iss` | quién emitió el token |
| `sub` | a quién se emitió; normalmente el ID del usuario |
| `aud` | para qué servicio es |
| `exp` | cuándo caduca (desde ese momento ya no es válido) |
| `nbf` | desde cuándo es válido |
| `iat` | cuándo se emitió |
| `jti` | ID único del token, para poder revocarlo |

`exp`, `nbf` e `iat` son Unix timestamps en segundos. Para pasar cualquiera de estos números a fecha, usa el [conversor de Unix timestamp](/es/dates/unix-timestamp/).

## Errores frecuentes

- **«Un JWT tiene tres partes»**: el token se copió incompleto o con texto de más. Suele pasar al copiar una línea cortada de un log.
- **Cinco partes**: es un JWE, un token cifrado. Sin la clave no se puede leer, y así debe ser.
- **«No es Base64URL válido»**: se colaron comillas, puntos suspensivos u otros caracteres ajenos.

## Preguntas frecuentes

**¿Por qué aparece «caducado» si el servidor sigue aceptando el token?** Los servidores suelen tolerar unos minutos de desfase de reloj (leeway). Comprueba también la hora de tu dispositivo: el estado se calcula con ella.

**¿Puedo cambiar el payload y reenviar el token?** Puedes cambiarlo, pero la firma dejará de coincidir y cualquier servidor que la verifique rechazará el token.

**¿Cómo decodifico una cadena Base64 cualquiera?** Para eso está el [decodificador Base64](/es/security/base64/); un JSON grande se lee mejor en el [formateador de JSON](/es/dev/json-formatter/).
