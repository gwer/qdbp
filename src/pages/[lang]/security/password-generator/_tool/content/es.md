## Cómo usarlo

Elige la longitud y los tipos de caracteres: la contraseña aparece al momento. «Generar de nuevo» crea otra y «Copiar» la copia al portapapeles.

La contraseña se genera en tu navegador con un generador de números aleatorios criptográficamente seguro (`crypto.getRandomValues`). No se envía a ningún servidor ni se guarda en ningún sitio.

## ¿Qué longitud debe tener una contraseña?

Lo que más importa es la longitud. En una contraseña aleatoria la seguridad se mide en entropía, es decir, cuántos bits de aleatoriedad contiene:

- 8 caracteres con letras y números: unos **48 bits**, seguridad media;
- 12 caracteres con todos los tipos: unos **78 bits**, alta;
- 16 caracteres con todos los tipos: unos **104 bits**, muy alta.

Para cuentas importantes conviene usar 14–16 caracteres o más y un gestor de contraseñas para no tener que recordarlas.

## Preguntas frecuentes

**¿Para qué quitar los caracteres parecidos?** Si alguna vez tienes que escribir la contraseña a mano, es fácil confundir l y 1 u O y 0. Apenas reduce la seguridad.

**¿Puedo usar la misma contraseña en varias webs?** Mejor no: si se filtra en una, todas las cuentas con esa contraseña quedan expuestas.

**¿Por qué siempre incluye un carácter de cada tipo elegido?** Muchas webs exigen al menos un número, una mayúscula, etc., y el generador lo garantiza.
