## Qué es un Unix timestamp

El tiempo Unix es el número de segundos transcurridos desde la medianoche UTC del 1 de enero de 1970. Así guardan el tiempo las bases de datos, los logs, las API y la mayoría de los lenguajes de programación. JavaScript y Java suelen usar milisegundos: el número tiene tres cifras más.

## Cómo usarlo

Pega el timestamp y elige las unidades. Verás la fecha y la hora en tu zona horaria, en UTC y en formato ISO 8601. Debajo aparece el timestamp actual, que se actualiza cada segundo.

Para el cálculo inverso, elige «Fecha → timestamp», introduce fecha y hora e indica si están en tu hora local o en UTC.

## Ejemplos

- `0`: 1 de enero de 1970, 00:00:00 UTC.
- `1767225600`: **1 de enero de 2026, 00:00:00 UTC**.
- `1700000000`: 14 de noviembre de 2023, 22:13:20 UTC.
- `2147483647`: 19 de enero de 2038, 03:14:07 UTC, el valor máximo de un entero de 32 bits con signo (el «problema del año 2038»).

## Preguntas frecuentes

**¿Son segundos o milisegundos?** Una fecha actual en segundos tiene 10 cifras; en milisegundos, 13.

**¿Se tiene en cuenta el horario de verano?** Sí, la hora local sigue las reglas de tu zona horaria para esa fecha.

**¿Puedo introducir un número negativo?** Sí, corresponde a fechas anteriores a 1970.
