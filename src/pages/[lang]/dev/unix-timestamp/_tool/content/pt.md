## O que é um Unix timestamp

O tempo Unix é o número de segundos desde a meia-noite UTC de 1º de janeiro de 1970. É assim que bancos de dados, logs, APIs e a maioria das linguagens de programação guardam o tempo. JavaScript e Java costumam usar milissegundos — o número fica três dígitos maior.

## Como usar

Cole o timestamp e escolha a unidade. Você vê a data e a hora no seu fuso horário, em UTC e no formato ISO 8601. Logo abaixo aparece o timestamp atual, atualizado a cada segundo.

Para o cálculo inverso, escolha «Data → timestamp», informe data e hora e diga se estão no seu horário local ou em UTC.

## Exemplos

- `0` — 1º de janeiro de 1970, 00:00:00 UTC.
- `1767225600` — **1º de janeiro de 2026, 00:00:00 UTC**.
- `1700000000` — 14 de novembro de 2023, 22:13:20 UTC.
- `2147483647` — 19 de janeiro de 2038, 03:14:07 UTC: o maior valor de um inteiro de 32 bits com sinal (o "problema do ano 2038").

## Perguntas frequentes

**São segundos ou milissegundos?** Datas atuais em segundos têm 10 dígitos; em milissegundos, 13.

**O horário de verão é considerado?** Sim, o horário local segue as regras do seu fuso para aquela data.

**Posso digitar um número negativo?** Sim, são datas anteriores a 1970.
