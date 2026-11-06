## Como usar

Adicione as imagens — arraste para cá, escolha no dispositivo ou cole da área de transferência (Ctrl+V). Cada uma vira uma página do PDF, na ordem da esquerda para a direita. A ordem muda arrastando ou com as setas abaixo da miniatura; ali também ficam os botões de girar e remover.

Configurações:

- **Tamanho da página** — A4 serve para imprimir e enviar documentos; Carta é o padrão dos EUA. "Do tamanho da imagem" deixa cada página exatamente do tamanho da foto, sem margens brancas.
- **Orientação** — "Igual à imagem" põe fotos horizontais em páginas paisagem e verticais em páginas retrato. Também dá para escolher uma orientação para todas as páginas.
- **Margens** — moldura branca em volta da imagem. Documentos escaneados costumam ir sem margens; fotos para imprimir, com margens de 10 mm.

Clique em "Criar PDF" e baixe o arquivo.

## Como funciona

JPG e PNG entram no PDF como estão, sem nova compressão, então a qualidade não se perde. Fotos de celular que têm a rotação gravada nos metadados ficam na posição certa. Para isso, a página recebe a propriedade de rotação, e os pixels não são alterados. A exceção são as raras fotos espelhadas: essas precisam ser salvas de novo em JPG com qualidade de 92%.

WebP, GIF, BMP e outros formatos que o PDF não suporta são convertidos para JPG com qualidade de 92%. As áreas transparentes ficam brancas.

A imagem é encaixada inteira na página, mantendo as proporções, e centralizada. Nada é cortado.

Os arquivos são processados no navegador e não são enviados a nenhum servidor.

## Perguntas frequentes

**O PDF ficou pesado. Como diminuir?** Fotos de celular pesam 3–5 MB cada e, como entram sem nova compressão, a página pesa o mesmo. Antes de criar o PDF, você pode [comprimir as fotos](/pt/images/compress-image/) ou [reduzir as dimensões](/pt/images/resize-image/). Também dá para fazer depois: o [compressor de PDF](/pt/pdf/compress-pdf/) salva de novo as imagens dentro do arquivo.

**A foto do iPhone não é adicionada. O que fazer?** Provavelmente ela está em HEIC. Ao escolher da galeria no próprio iPhone, as fotos costumam ir já em JPG; arquivos HEIC copiados para o computador precisam primeiro ser [convertidos para JPG](/pt/images/heic-to-jpg/).

**Como adicionar imagens a um PDF que já existe?** Crie aqui um PDF com as imagens e depois junte-o ao documento na [junção de PDF](/pt/pdf/merge-pdf/).
