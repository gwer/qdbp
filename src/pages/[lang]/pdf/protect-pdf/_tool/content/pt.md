## Como usar

Escolha um PDF e crie uma senha. Clique em "Proteger PDF" e baixe o arquivo: a partir daí, qualquer programa — navegador, Acrobat, leitor no celular — vai pedir a senha antes de mostrar o conteúdo.

Você também pode limitar o que pode fazer quem abriu o arquivo com a senha: imprimir, copiar texto, alterar. Para as restrições é preciso uma segunda senha, a senha do proprietário. Ela remove as restrições, por isso precisa ser diferente da senha para abrir.

Anote a senha. Não há como recuperá-la: nós não a vemos nem a guardamos, e descobrir a senha de uma criptografia AES-256 por tentativa é praticamente impossível.

## Como funciona

O conteúdo do arquivo é criptografado com o algoritmo AES-256 — a opção mais forte prevista no padrão PDF (ISO 32000-2). Ela é suportada pelo Acrobat Reader desde a versão X, pelos navegadores e pelos leitores modernos de celular.

A criptografia é feita no navegador: nem o arquivo nem a senha são enviados a lugar nenhum.

As restrições de impressão e cópia, ao contrário da senha para abrir, são um acordo, não uma cifra. O Acrobat e a maioria dos programas as respeitam, mas alguns leitores as ignoram. Não conte com elas para documentos realmente sigilosos: o que protege de fato é a senha para abrir.

## Perguntas frequentes

**Que senha escolher?** Uma longa: a força depende antes de tudo do comprimento. Uma frase de quatro ou cinco palavras aleatórias é mais segura que uma sequência curta de caracteres. O [gerador de senhas](/pt/security/password-generator/) ajuda a criar uma assim.

**Como tirar a senha depois?** Abra o arquivo no [desbloqueio de PDF](/pt/pdf/unlock-pdf/) e digite a senha.

**Os marcadores e formulários são mantidos?** Sim, o documento é criptografado inteiro, como está, e nada é removido.
