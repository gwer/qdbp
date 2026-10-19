## Qué es un hash

Un hash es una «huella» de los datos de longitud fija. El mismo texto siempre da el mismo hash, y cambiar un solo carácter lo cambia por completo. A partir del hash no se puede recuperar el texto original.

Los hashes se usan como sumas de verificación de archivos, en firmas digitales, en Git y en blockchain.

## Cómo usarlo

Escribe o pega un texto: los hashes de todos los algoritmos se calculan al instante. El texto se codifica en UTF-8 y todo se hace en tu navegador.

## Ejemplos

- `hello` → MD5 `5d41402abc4b2a76b9719d911017c592`
- `hello` → SHA-256 `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`

## ¿Qué algoritmo elegir?

- **SHA-256** es el estándar actual para sumas de verificación, firmas y comprobaciones de integridad.
- **SHA-384 y SHA-512** son variantes más largas de la misma familia.
- **MD5 y SHA-1** están obsoletos: existen ataques de colisión prácticos. Úsalos solo por compatibilidad o para comprobaciones rápidas, nunca por seguridad.

## Preguntas frecuentes

**¿Puedo guardar contraseñas como SHA-256?** No. Las contraseñas necesitan funciones lentas y con sal diseñadas para ello: bcrypt, scrypt o Argon2.

**¿Por qué mi hash no coincide con el de otra herramienta?** Revisa los espacios o saltos de línea al final y la codificación: aquí el texto siempre está en UTF-8.
