## Cómo usarlo

Indica el rango «desde» y «hasta» (ambos incluidos), cuántos números necesitas y si se pueden repetir. Pulsa «Generar»: cada vez obtendrás una tanda nueva.

## Un azar justo

Los números se generan en tu navegador con un generador criptográfico (`crypto.getRandomValues`). Todos los números del rango tienen exactamente la misma probabilidad: la calculadora descarta los pocos valores que, de lo contrario, favorecerían ligeramente a los números más bajos.

## Ejemplos

- Tirar un dado: de 1 a 6, un número.
- Sortear un premio entre 250 participantes: de 1 a 250, un número.
- Tres ganadores sin repetir: de 1 a 250, tres números, «Sin repetir».
- Una combinación de la Primitiva: de 1 a 49, seis números sin repetir, de menor a mayor.

## Preguntas frecuentes

**¿Se puede predecir o manipular el resultado?** No. El generador no usa la hora ni otros datos previsibles, y los resultados no se guardan en ningún sitio.

**¿Cuántos números puedo generar a la vez?** Hasta 1000. Sin repetir, no más de los que hay en el rango.

**¿Funcionan los números negativos?** Sí, por ejemplo de −10 a 10.
