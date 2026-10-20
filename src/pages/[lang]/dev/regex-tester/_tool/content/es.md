## Cómo se usa

Escribe la expresión regular sin las barras y pega el texto. El probador al instante:

- resalta todas las coincidencias en el texto (las contiguas, en colores alternos; las vacías, con una raya fina);
- muestra cuántas hay y una tabla con la posición de cada una (desde cero, como `index` en JavaScript) y sus grupos: número, nombre si es un grupo con nombre y `—` si el grupo no participó;
- con **Reemplazar** activado, muestra el resultado de `text.replace(regex, reemplazo)`, listo para copiar.

Funciona con el motor de expresiones regulares de tu propio navegador, así que el resultado es el mismo que obtendrá tu código en JavaScript o TypeScript. Sin el flag `g` solo se encuentra la primera coincidencia, igual que con `match` y `replace`. Se muestran hasta 1000 coincidencias.

El texto se procesa en el navegador y no se envía a ningún sitio.

## Flags

| Flag | Qué hace |
|---|---|
| `g` | busca todas las coincidencias, no solo la primera |
| `i` | no distingue mayúsculas de minúsculas |
| `m` | `^` y `$` funcionan al principio y al final de cada línea, no solo del texto entero |
| `s` | el punto `.` también coincide con los saltos de línea |
| `u` | modo Unicode: clases `\p{…}`, caracteres fuera del BMP (emojis) como un solo carácter, sintaxis estricta |
| `y` | búsqueda «pegajosa» (sticky): cada coincidencia debe empezar justo donde terminó la anterior |

## Chuleta

| Patrón | Significado |
|---|---|
| `.` | cualquier carácter excepto el salto de línea |
| `\d`, `\w`, `\s` | dígito, letra latina/dígito/`_`, espacio en blanco |
| `\D`, `\W`, `\S` | cualquier cosa excepto lo anterior |
| `[abc]`, `[^0-9]` | uno de esos caracteres; cualquiera menos un dígito |
| `*`, `+`, `?` | 0 o más, 1 o más, 0 o 1 vez |
| `{2,5}` | de 2 a 5 veces |
| `*?`, `+?` | versiones perezosas: el menor número de caracteres posible |
| `^`, `$`, `\b` | inicio, final, límite de palabra |
| `(…)`, `(?<nombre>…)`, `(?:…)` | grupo, grupo con nombre, grupo sin captura |
| `a\|b` | `a` o `b` |
| `(?=…)`, `(?!…)` | va seguido / no va seguido de … |
| `(?<=…)`, `(?<!…)` | va precedido / no va precedido de … |
| `\p{L}` | cualquier letra de cualquier alfabeto (requiere el flag `u`) |

## Ejemplos

**Números en un texto.** `\d+` con el flag `g` en «Pedido 15 por 1.250 €» da tres coincidencias: `15`, `1` y `250`, porque el punto de los miles parte el número. Para captarlo entero, usa `\d[\d.]*`.

**Palabras repetidas.** `\b(\w+)\s+\1\b` con los flags `gi` encuentra «el el» en «Lee el el manual»: `\1` remite al texto que capturó el primer grupo.

**Espacios de más.** Patrón `\s{2,}`, flag `g` y un solo espacio como reemplazo: «demasiados   espacios» → «demasiados espacios».

**Intercambio con grupos con nombre.** El patrón `(?<first>\p{L}+) (?<last>\p{L}+)` con el flag `u` y el reemplazo `$<last>, $<first>` convierten «José García» en «García, José».

## La cadena de reemplazo

- `$1`, `$2` …: el texto de un grupo por su número;
- `$<nombre>`: el texto de un grupo con nombre;
- `$&`: la coincidencia completa;
- `` $` `` y `$'`: el texto antes y después de la coincidencia;
- `$$`: el signo de dólar tal cual.

Por ejemplo, el patrón `(\d+)-(\d+)-(\d+)` con el reemplazo `$3/$2/$1` convierte `2026-03-15` en `15/03/2026`.

## Preguntas frecuentes

**¿Por qué `\w` no reconoce letras como á, ñ o ü?** En JavaScript `\w` es solo `[A-Za-z0-9_]`, y `\b` es el límite entre esos caracteres. Con `\w+`, «José» se queda en `Jos`. Para letras de cualquier idioma usa `\p{L}` con el flag `u`.

**¿Por qué sin el flag `g` solo aparece una coincidencia?** Así funciona JavaScript: `str.match(re)` y `str.replace(re, …)` sin `g` solo tratan la primera coincidencia. El probador hace lo mismo para que el resultado coincida con tu código.

**La página dice que se ha detenido la ejecución. ¿Qué significa?** Algunas expresiones, como `(a+)+$`, tardan un tiempo exponencial con una cadena que casi coincide: es el llamado backtracking catastrófico (ReDoS). El probador trabaja en un hilo aparte y lo detiene a los 2 segundos para que la página no se cuelgue. En código real conviene reescribir esa expresión sin cuantificadores anidados.

**¿Sirve para expresiones regulares de Python, PHP o Java?** La sintaxis básica es común, pero hay diferencias: JavaScript no tiene cuantificadores posesivos como `a++` ni grupos atómicos, los flags se indican de otra forma y en Python los grupos con nombre se escriben `(?P<nombre>…)`. Las expresiones sencillas funcionan igual.

Para quitar duplicados u ordenar líneas, prueba las [herramientas de líneas](/es/text/line-tools/); para comparar dos versiones de un texto, la [comparación de textos](/es/dev/text-diff/).
