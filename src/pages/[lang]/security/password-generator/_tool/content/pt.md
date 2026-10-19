## Como usar

Escolha o tamanho e os tipos de caracteres: a senha aparece na hora. "Gerar novamente" cria outra e "Copiar" copia para a área de transferência.

A senha é gerada no seu navegador com um gerador de números aleatórios criptograficamente seguro (`crypto.getRandomValues`). Ela não é enviada a nenhum servidor nem salva em lugar nenhum.

## Qual deve ser o tamanho da senha?

O que mais importa é o tamanho. Em uma senha aleatória, a segurança é medida pela entropia — quantos bits de aleatoriedade ela tem:

- 8 caracteres com letras e números — cerca de **48 bits**: média;
- 12 caracteres com todos os tipos — cerca de **78 bits**: forte;
- 16 caracteres com todos os tipos — cerca de **104 bits**: muito forte.

Para contas importantes, vale usar 14–16 caracteres ou mais e um gerenciador de senhas para não precisar decorá-las.

## Perguntas frequentes

**Para que tirar os caracteres parecidos?** Se um dia for preciso digitar a senha à mão, é fácil confundir l e 1 ou O e 0. A segurança quase não muda.

**Posso usar a mesma senha em vários sites?** Melhor não: se um site vazar, todas as contas com essa senha ficam em risco.

**Por que a senha sempre tem um caractere de cada tipo escolhido?** Muitos sites exigem pelo menos um número, uma letra maiúscula etc. — o gerador garante isso.
