## Como usar

Digite a expressão regular sem as barras e cole o texto. O testador na hora:

- destaca todas as correspondências no texto (as vizinhas em cores alternadas, as vazias com um traço fino);
- mostra quantas são e uma tabela com a posição de cada uma (a partir de zero, como `index` no JavaScript) e os grupos: número, nome nos grupos nomeados e `—` quando o grupo não participou;
- com **Substituir** ligado, mostra o resultado de `text.replace(regex, substituição)`, pronto para copiar.

Quem trabalha é o motor de regex do seu próprio navegador, então o resultado é o mesmo que o seu código em JavaScript ou TypeScript vai obter. Sem a flag `g`, só a primeira correspondência é encontrada, igual a `match` e `replace`. São exibidas até 1.000 correspondências.

O texto é processado no navegador e não é enviado a lugar nenhum.

## Flags

| Flag | O que faz |
|---|---|
| `g` | encontra todas as correspondências, não só a primeira |
| `i` | ignora a diferença entre maiúsculas e minúsculas |
| `m` | `^` e `$` valem no início e no fim de cada linha, não só do texto inteiro |
| `s` | o ponto `.` também corresponde à quebra de linha |
| `u` | modo Unicode: classes `\p{…}`, caracteres fora do BMP (emojis) como um só caractere, sintaxe estrita |
| `y` | busca "grudada" (sticky): cada correspondência precisa começar exatamente onde a anterior terminou |

## Cola rápida

| Padrão | Significado |
|---|---|
| `.` | qualquer caractere, menos quebra de linha |
| `\d`, `\w`, `\s` | dígito, letra latina/dígito/`_`, espaço em branco |
| `\D`, `\W`, `\S` | tudo, menos o que está acima |
| `[abc]`, `[^0-9]` | um desses caracteres; qualquer um menos dígito |
| `*`, `+`, `?` | 0 ou mais, 1 ou mais, 0 ou 1 vez |
| `{2,5}` | de 2 a 5 vezes |
| `*?`, `+?` | versões preguiçosas (lazy): o mínimo possível de caracteres |
| `^`, `$`, `\b` | início, fim, limite de palavra |
| `(…)`, `(?<nome>…)`, `(?:…)` | grupo, grupo nomeado, grupo sem captura |
| `a\|b` | `a` ou `b` |
| `(?=…)`, `(?!…)` | seguido / não seguido de … |
| `(?<=…)`, `(?<!…)` | precedido / não precedido de … |
| `\p{L}` | qualquer letra de qualquer alfabeto (precisa da flag `u`) |

## Exemplos

**Números no texto.** `\d+` com a flag `g` em "Pedido 15 de R$ 1.250" dá três correspondências: `15`, `1` e `250`, porque o ponto do milhar quebra o número. Para pegá-lo inteiro, use `\d[\d.]*`.

**Palavras repetidas.** `\b(\w+)\s+\1\b` com as flags `gi` acha "o o" em "Leia o o manual": `\1` se refere ao texto capturado pelo primeiro grupo.

**Espaços sobrando.** Padrão `\s{2,}`, flag `g` e um único espaço como substituição: "espaços   demais" → "espaços demais".

**Troca com grupos nomeados.** O padrão `(?<first>\p{L}+) (?<last>\p{L}+)` com a flag `u` e a substituição `$<last>, $<first>` transformam "João Silva" em "Silva, João".

## A string de substituição

- `$1`, `$2` …: o texto de um grupo pelo número;
- `$<nome>`: o texto de um grupo nomeado;
- `$&`: a correspondência inteira;
- `` $` `` e `$'`: o texto antes e depois da correspondência;
- `$$`: o próprio cifrão.

Por exemplo, o padrão `(\d+)-(\d+)-(\d+)` com a substituição `$3/$2/$1` transforma `2026-03-15` em `15/03/2026`.

## Perguntas frequentes

**Por que `\w` não reconhece letras como ã, ç ou é?** No JavaScript, `\w` é só `[A-Za-z0-9_]`, e `\b` é o limite entre esses caracteres. Com `\w+`, "João" vira `Jo` e `o`. Para letras de qualquer idioma, use `\p{L}` com a flag `u`.

**Por que sem a flag `g` aparece só uma correspondência?** É assim que o JavaScript funciona: `str.match(re)` e `str.replace(re, …)` sem `g` tratam só a primeira correspondência. O testador repete esse comportamento para o resultado bater com o seu código.

**A página diz que a execução foi interrompida. O que isso quer dizer?** Algumas expressões, como `(a+)+$`, levam tempo exponencial numa string que quase corresponde: é o chamado backtracking catastrófico (ReDoS). O testador roda numa thread separada e a interrompe depois de 2 segundos para a página não travar. No código de verdade, vale reescrever a expressão sem quantificadores aninhados.

**Serve para regex de Python, PHP ou Java?** A sintaxe básica é a mesma, mas há diferenças: o JavaScript não tem quantificadores possessivos como `a++` nem grupos atômicos, as flags são definidas de outro jeito e, no Python, grupo nomeado se escreve `(?P<nome>…)`. Expressões simples funcionam igual em todo lugar.

Para tirar linhas duplicadas ou ordenar listas, use as [ferramentas de linhas](/pt/text/line-tools/); para comparar duas versões de um texto, a [comparação de textos](/pt/dev/text-diff/).
