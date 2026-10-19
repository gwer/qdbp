## O que é Base64

Base64 é uma forma de escrever qualquer dado — texto, imagem, arquivo — usando só letras latinas, números e os sinais `+`, `/` e `=`. É usado onde só se aceita texto: e-mails, JSON, data URLs e cabeçalhos HTTP como `Authorization: Basic`.

Base64 é **codificação, não criptografia**: qualquer pessoa pode decodificar, sem senha.

## Como usar

Escolha "Codificar" ou "Decodificar" e cole o texto: o resultado aparece na hora. O texto é codificado em UTF-8, então acentos, ç e emojis funcionam. Na decodificação também são aceitos a variante URL-safe (`-` e `_` no lugar de `+` e `/`) e textos sem `=` no final.

## Exemplos

- `olá, mundo` → `b2zDoSwgbXVuZG8=`
- `aGVsbG8=` → `hello`

## Perguntas frequentes

**Por que o texto codificado fica maior?** Cada 3 bytes viram 4 caracteres, então o tamanho cresce cerca de um terço.

**O que significam os `=` no final?** São preenchimento: o tamanho de um Base64 é sempre múltiplo de 4.

**Por que dá erro ao decodificar?** O texto tem caracteres inválidos ou o conteúdo não é texto (uma imagem, por exemplo).

Para links, use a [codificação de URL](/pt/security/url-encode/).
