## O que é um hash

Um hash é uma "impressão digital" dos dados, com tamanho fixo. O mesmo texto sempre gera o mesmo hash, e mudar um único caractere o altera completamente. Não é possível recuperar o texto original a partir do hash.

Hashes são usados em checksums de arquivos, assinaturas digitais, Git e blockchain.

## Como usar

Digite ou cole um texto: os hashes de todos os algoritmos são calculados na hora. O texto é codificado em UTF-8 e tudo roda no navegador.

## Exemplos

- `hello` → MD5 `5d41402abc4b2a76b9719d911017c592`
- `hello` → SHA-256 `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`

## Qual algoritmo usar?

- **SHA-256** é o padrão atual para checksums, assinaturas e verificações de integridade.
- **SHA-384 e SHA-512** são versões mais longas da mesma família.
- **MD5 e SHA-1** estão obsoletos: existem ataques de colisão práticos. Use apenas por compatibilidade ou em verificações rápidas, nunca para segurança.

## Perguntas frequentes

**Posso guardar senhas como SHA-256?** Não. Senhas exigem funções lentas e com salt feitas para isso — bcrypt, scrypt ou Argon2.

**Por que meu hash não bate com o de outra ferramenta?** Confira espaços ou quebras de linha no final e a codificação: aqui o texto é sempre UTF-8.
