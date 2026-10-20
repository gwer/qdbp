## Como usar

Cole o token no campo, sozinho ou com o prefixo `Authorization: Bearer …`; quebras de linha não atrapalham. O decodificador mostra na hora:

- **o cabeçalho**: o algoritmo de assinatura (`alg`), o tipo (`typ`) e às vezes o ID da chave (`kid`);
- **o payload**: todos os dados do token em JSON formatado;
- **as datas `iat`, `nbf` e `exp`**: com data e hora no fuso do seu dispositivo e em relação ao momento atual ("em 3 dias", "há 2 horas");
- **o status**: se o token já expirou ou ainda vale;
- **a assinatura**: do jeito que está, como texto Base64URL.

O token é decodificado no navegador e não é enviado a um servidor. Mantenha os tokens de acesso reais em segredo: um token bearer válido que vaze pode permitir acesso dentro de suas permissões até expirar ou ser revogado. A decodificação não confirma a validade do token.

## A assinatura não é verificada

O decodificador mostra o conteúdo, mas não confere a assinatura: para isso é preciso a chave secreta ou pública do servidor. O payload de um JWT comum não é criptografado, só codificado em Base64URL: qualquer um consegue ler, mas ninguém consegue falsificar sem a chave. Por isso:

- não guarde senhas nem dados pessoais no token;
- não tome decisões com base nos dados do token antes de o servidor validar a assinatura;
- um token com `"alg": "none"` e a terceira parte vazia não tem proteção nenhuma.

## Partes de um JWT

O token tem três partes separadas por pontos: `cabeçalho.payload.assinatura`. As duas primeiras são JSON codificado em Base64URL (Base64 em que `+` e `/` viram `-` e `_` e os `=` do final são removidos). Este é o exemplo da RFC 7519:

`eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`

O cabeçalho é `{"typ":"JWT","alg":"HS256"}` e o payload, `{"iss":"joe","exp":1300819380,"http://example.com/is_root":true}`. O valor de `exp`, 1300819380, corresponde a 22 de março de 2011, 18:43 UTC: o token expirou há muito tempo.

## Claims padrão

| Campo | Significado |
|---|---|
| `iss` | quem emitiu o token |
| `sub` | para quem foi emitido; em geral, o ID do usuário |
| `aud` | para qual serviço ele serve |
| `exp` | quando expira (a partir daí o token é inválido) |
| `nbf` | a partir de quando vale |
| `iat` | quando foi emitido |
| `jti` | ID único do token, para permitir revogá-lo |

`exp`, `nbf` e `iat` são Unix timestamps em segundos. Para converter qualquer um desses números em data, use o [conversor de Unix timestamp](/pt/dates/unix-timestamp/).

## Erros comuns

- **"Um JWT tem três partes"**: o token foi copiado pela metade ou com texto a mais. Costuma acontecer ao copiar uma linha cortada de um log.
- **Cinco partes**: é um JWE, um token criptografado. Sem a chave não dá para ler, e é assim mesmo.
- **"Não é Base64URL válido"**: entraram aspas, reticências ou outros caracteres estranhos no token.

## Perguntas frequentes

**Por que aparece "expirado" se o servidor ainda aceita o token?** Servidores costumam tolerar alguns minutos de diferença de relógio (leeway). Confira também o relógio do seu dispositivo: o status é calculado por ele.

**Posso alterar o payload e devolver o token?** Alterar dá, mas a assinatura deixa de bater e qualquer servidor que a verifique vai recusar o token.

**Como decodifico uma string Base64 qualquer?** Use o [decodificador Base64](/pt/security/base64/); JSON grande fica mais fácil de ler no [formatador de JSON](/pt/dev/json-formatter/).
