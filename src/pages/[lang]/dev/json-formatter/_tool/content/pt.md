## Como usar

Cole o JSON e ele é formatado com indentação na hora. Se houver erro, você vê a linha e a coluna exatas. Modos:

- **Indentação de 2 ou 4 espaços, tabulações** — para ler e colar no código;
- **Ordenar chaves** — chaves dos objetos em ordem alfabética em todos os níveis, útil para comparar dois JSON;
- **Minificar** — tudo em uma linha, sem espaços extras, para APIs e arquivos de configuração.

Os dados são processados no navegador e não são enviados a lugar nenhum, então dá para conferir JSON com tokens ou dados pessoais.

## Erros comuns em JSON

- **Aspas simples:** `{'a': 1}` — em JSON, strings e chaves usam aspas duplas.
- **Vírgula no final:** `[1, 2,]` — não é permitido em JSON (em JavaScript, sim).
- **Chaves sem aspas:** `{a: 1}` — isso é JavaScript, não JSON.
- **Comentários** `//` e `/* */` — o JSON padrão não tem.
- **Zeros à esquerda** como `01`, além de `NaN` e `undefined` — valores inválidos.

## Perguntas frequentes

**Por que os acentos não viram `ç`?** Não é preciso escapar: JSON é UTF-8 por definição.

**Existe limite de tamanho?** Só a memória do seu dispositivo; arquivos de vários megabytes são processados em frações de segundo.

Para codificar o JSON em uma URL ou em Base64, use a [codificação de URL](/pt/security/url-encode/) ou o [Base64](/pt/security/base64/).
