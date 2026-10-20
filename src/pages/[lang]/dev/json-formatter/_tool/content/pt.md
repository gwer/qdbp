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

**Por que `ç` não vira `\u00e7`?** JSON permite escrever esse caractere diretamente; a sequência de escape Unicode é opcional.

**Existe limite de tamanho?** O processamento depende da memória disponível e do desempenho do seu dispositivo. Documentos grandes podem demorar mais.

**Os números podem mudar?** Inteiros muito grandes e decimais com muitas casas, sim: o navegador guarda os números do JSON com cerca de 15–17 dígitos significativos. Por exemplo, `9007199254740993` vira `9007199254740992`. Se os seus dados têm IDs ou valores assim, guarde-os como strings.

Para codificar o JSON em uma URL ou em Base64, use a [codificação de URL](/pt/security/url-encode/) ou o [Base64](/pt/security/base64/).
