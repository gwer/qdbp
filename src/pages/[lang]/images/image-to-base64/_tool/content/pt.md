## Como usar

**Imagem → Base64.** Adicione uma imagem e receba-a como data URL, Base64 puro, uma regra CSS pronta ou uma tag `<img>`. Copie o resultado e cole no seu código.

**Base64 → imagem.** Cole um data URL ou uma string Base64 — a imagem aparece na hora e pode ser baixada. O formato é identificado pelo conteúdo, mesmo que o cabeçalho diga outra coisa.

Tudo funciona no seu navegador; o arquivo não é enviado a lugar nenhum.

## Exemplo

Um PNG transparente de 1 × 1 pixel tem 70 bytes e, como data URL, fica assim:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==`

## Para que serve

- Ícones e imagens pequenas direto no CSS ou HTML — sem uma requisição a mais ao servidor.
- Imagens dentro de JSON, e-mails e templates onde não dá para anexar arquivo.
- Depuração: ver que imagem está escondida numa string Base64 vinda de uma API ou banco de dados.

## Perguntas frequentes

**Por que o Base64 é maior que o arquivo?** Cada 3 bytes viram 4 caracteres, então o tamanho cresce cerca de um terço.

**Vale a pena colocar fotos grandes assim?** Não: a página fica mais pesada e o navegador não consegue guardar a imagem em cache separadamente. Data URLs funcionam bem para arquivos de poucos kilobytes. Imagens grandes é melhor [comprimir](/pt/images/compress-image/) e usar com um link normal.

**Base64 é criptografia?** Não, é só outra forma de escrever os mesmos dados — qualquer um pode decodificar. Para texto, use a [codificação Base64](/pt/security/base64/).
