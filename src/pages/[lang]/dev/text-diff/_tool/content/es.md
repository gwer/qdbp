## Cómo se usa

Pega el texto original en «Original» y la versión nueva en «Modificado». Las diferencias aparecen al momento:

«Ignorar espacios» e «Ignorar mayúsculas» dejan fuera los espacios de más, la sangría y las mayúsculas: solo se ven los cambios de contenido.

- **en rojo**, las líneas que faltan en el segundo texto (eliminadas);
- **en verde**, las que no estaban en el primero (añadidas);
- una línea modificada se muestra como la pareja «eliminada + añadida», con las palabras y signos que cambian resaltados con más intensidad.

Encima del resultado está el recuento de líneas añadidas y eliminadas. La vista **En paralelo** pone los textos en dos columnas; la **Unificada** muestra los cambios uno tras otro, como `git diff`. En el móvil el resultado siempre es unificado, porque dos columnas no caben. Los tramos largos sin cambios se pliegan a tres líneas alrededor de cada cambio; desmarca «Ocultar líneas sin cambios» para verlo todo.

Los textos se comparan en tu navegador y no se envían a ningún sitio: puedes comparar contratos, configuraciones y código.

## Ejemplo

| Original | Modificado |
|---|---|
| Lista de la compra: | Lista de la compra: |
| leche — 2 litros | leche — 1 litro |
| pan | pan |
| huevos — una docena | huevos — una docena |
| queso | café |
| café | azúcar |

Resultado: 2 líneas añadidas y 2 eliminadas. La línea de la leche ha cambiado y dentro de ella se resaltan «2 litros» y «1 litro». El queso se ha eliminado, el azúcar se ha añadido y el resto de líneas coinciden. Este ejemplo viene cargado en la herramienta.

## Cómo funciona

Los dos textos se dividen en líneas y la herramienta busca el **conjunto de cambios más corto**: el mínimo de líneas eliminadas y añadidas que convierte el primer texto en el segundo. Es el algoritmo de Myers, el mismo que usa `git diff` por defecto. Dentro de cada pareja de líneas modificadas se comparan del mismo modo las palabras, los espacios y los signos de puntuación.

Si dos líneas no comparten ninguna palabra, el resaltado interno no aporta nada, así que simplemente se muestran como eliminada y añadida.

## Preguntas frecuentes

**¿Por qué un párrafo que he movido aparece como eliminado y añadido?** La comparación busca una secuencia común de líneas en su orden original. Un bloque movido no puede quedarse en su sitio dentro de esa secuencia, así que aparece eliminado en la posición antigua y añadido en la nueva.

**No veo ninguna diferencia, pero las líneas salen como modificadas.** Lo más probable es que sea un carácter invisible: un espacio al final de la línea, un tabulador en lugar de espacios, un espacio de no separación. Los distintos finales de línea (Windows `\r\n` y Unix `\n`) no cuentan como diferencia. Puedes quitar los espacios de los extremos de cada línea con las [herramientas de líneas](/es/text/line-tools/).

**¿Sirve para textos grandes?** Sí: textos de decenas de miles de líneas se comparan en una fracción de segundo si no hay demasiadas diferencias. Los textos grandes completamente distintos tardan más.

**¿Puedo comparar dos JSON?** Sí, pero antes pasa los dos por el [formateador de JSON](/es/dev/json-formatter/) ordenando las claves: así solo quedarán las diferencias reales y no las de sangría u orden de los campos.
