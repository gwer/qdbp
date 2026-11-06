## Cómo usarlo

Elige un PDF y una contraseña. Pulsa «Proteger PDF» y descarga el archivo: a partir de ahora cualquier programa (el navegador, Acrobat, el visor del móvil) pedirá la contraseña antes de mostrar el contenido.

Además, puedes limitar lo que puede hacer quien abra el archivo con la contraseña: imprimir, copiar texto, hacer cambios. Para las restricciones hace falta una segunda contraseña, la de propietario. Esta quita las restricciones, así que tiene que ser distinta de la de apertura.

Apunta la contraseña. No se puede recuperar: no la vemos ni la guardamos, y adivinar una contraseña de un cifrado AES-256 es prácticamente imposible.

## Cómo funciona

El contenido del archivo se cifra con AES-256, la opción más robusta que prevé el estándar PDF (ISO 32000-2). La admiten Acrobat Reader desde la versión X, los navegadores y los visores modernos del móvil.

El cifrado se hace en tu navegador: ni el archivo ni la contraseña se envían a ningún sitio.

Las restricciones de impresión y copia, a diferencia de la contraseña de apertura, son un acuerdo, no un cifrado. Acrobat y la mayoría de los programas las respetan, pero algunos visores las ignoran. No te fíes de ellas para documentos realmente confidenciales: lo único que protege es la contraseña de apertura.

## Preguntas frecuentes

**¿Qué contraseña elijo?** Una larga: la seguridad depende sobre todo de la longitud. Una frase de cuatro o cinco palabras al azar es más segura que una combinación corta de símbolos. El [generador de contraseñas](/es/security/password-generator/) te ayuda a crearla.

**¿Cómo quito la contraseña más adelante?** Abre el archivo en el [desbloqueo de PDF](/es/pdf/unlock-pdf/) y escribe la contraseña.

**¿Se conservan los marcadores y los formularios?** Sí: el documento se cifra entero, tal como está, sin quitar nada.
