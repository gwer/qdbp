## Como usar

Escolha o algoritmo, escreva os dados do token (payload) em JSON e o segredo — o token pronto aparece abaixo, é só copiar. O cabeçalho é montado sozinho: `{"alg":"HS256","typ":"JWT"}` com o algoritmo escolhido.

O token é criado no navegador; o segredo e os dados não são enviados a lugar nenhum. O exemplo que abre por padrão é o mesmo token do [decodificador JWT](/pt/dev/jwt-decoder/), onde você também pode conferir a assinatura do token gerado.

Só há assinatura com segredo compartilhado (HS256, HS384, HS512). Assinaturas RS e ES com chave privada não são geradas aqui.

## O segredo

O segredo é usado como texto em UTF-8, que é como a maioria das bibliotecas o interpreta quando ele é passado como string. Se o seu serviço guarda o segredo em Base64 ou hex, a assinatura com essa string não vai bater: o serviço assina com os bytes decodificados.

A RFC 7518 exige uma chave pelo menos do tamanho da saída do hash: 32 bytes para HS256, 48 para HS384 e 64 para HS512. Se o segredo for menor, aparece um aviso. Uma letra sem acento ocupa 1 byte; ç e letras acentuadas, 2. Para um segredo longo e aleatório, use o [gerador de senhas](/pt/security/password-generator/).

## Como o token é formado

1. O cabeçalho e o payload são escritos em JSON sem espaços e codificados em Base64URL (Base64 com `+` e `/` trocados por `-` e `_`, sem os `=` do final).
2. As duas partes são unidas por um ponto, e dessa string é calculado um HMAC com o hash escolhido (SHA-256, SHA-384 ou SHA-512) e o segredo.
3. A assinatura em Base64URL entra como terceira parte: `cabeçalho.payload.assinatura`.

O exemplo do jwt.io: algoritmo HS256, payload `{"sub":"1234567890","name":"John Doe","iat":1516239022}`, segredo `your-256-bit-secret`. O resultado é

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

O segredo desse exemplo tem 19 bytes, então aparece o aviso de que ele é curto para HS256.

## Perguntas frequentes

**Como definir a validade?** Com `exp` (expira), `nbf` (vale a partir de) e `iat` (emitido), em segundos Unix, não em milissegundos. Para converter uma data em segundos, use o [conversor de Unix timestamp](/pt/dev/unix-timestamp/).

**O payload é criptografado?** Não, só codificado: qualquer pessoa com o token consegue ler. Não coloque senhas nem dados pessoais no token — a assinatura protege contra falsificação, não contra leitura.

**Por que meu token é diferente do token do meu servidor com os mesmos dados?** A assinatura depende de cada byte: ordem dos campos, espaços no JSON, campos extras no cabeçalho como `kid`. Esta ferramenta escreve o JSON sem espaços e mantém os campos na ordem em que você digitou. O servidor confere a assinatura sobre o próprio token, então vai aceitá-lo mesmo assim se o segredo e o algoritmo forem os mesmos.

**Números grandes mudam.** O navegador não guarda com exatidão inteiros acima de 9.007.199.254.740.991: escreva esses valores no payload como strings.
