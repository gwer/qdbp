## Como usar

Escolha o PDF, o modo e o nível de compressão e clique em "Comprimir PDF". Ao lado do resultado aparece quanto o arquivo pesava e quanto pesa agora. No modo "Comprimir imagens", se não der para diminuir, é baixado o arquivo original: esse modo não entrega um arquivo maior. No modo "Como digitalização", dá para baixar o resultado mesmo que fique maior, com um aviso.

**Comprimir imagens** é o modo principal. Quase todo o peso de um PDF costuma vir de fotos e digitalizações. Elas são reduzidas até a resolução escolhida e salvas de novo em JPG. Texto, fontes, links, marcadores e campos de formulário não mudam.

**Como digitalização** transforma cada página em uma única imagem JPG. É o modo reserva para quando comprimir as imagens quase não adiantou. Ele ajuda se o peso vem de imagens em formatos que o modo principal não mexe (JPEG 2000, CMYK, com paleta), de plantas, diagramas e mapas complexos ou de fontes incorporadas grandes. Um documento escaneado comum, feito de fotos das páginas, também é reduzido pelo modo principal, e o texto reconhecido na digitalização continua lá. "Como digitalização" remove o texto: não dá mais para selecioná-lo, copiá-lo nem encontrá-lo pela busca. Um documento que é quase só texto fica mais pesado como imagens do que está agora. Mesmo assim dá para baixar esse resultado se você precisa que o texto, uma assinatura ou uma marca d'água não possam ser separados da página.

O nível de compressão define a resolução das imagens:

- **200 dpi** — qualidade quase igual à do original, serve para impressão.
- **150 dpi** — bom equilíbrio. O texto das digitalizações continua legível, e as fotos ficam boas na tela e na impressão.
- **100 dpi** — o menor arquivo. Letras pequenas em digitalizações podem ficar menos legíveis.

## Como funciona

O limite de resolução é calculado a partir do tamanho da página: por exemplo, numa página A4 a 150 dpi a imagem é reduzida até 1754 pixels no lado maior. Imagens que já são menores só são salvas de novo em JPG. A nova versão substitui a antiga apenas se ficar pelo menos 10% mais leve.

Além disso, são removidos sem perdas os objetos que ficaram no arquivo depois de edições anteriores e não são mais usados em lugar nenhum. Dados internos sem compressão são comprimidos.

São salvas de novo as fotos em JPG e as imagens comuns coloridas e em tons de cinza. Imagens em JPEG 2000, JBIG2, CMYK e com paleta ficam como estão. Digitalizações em preto e branco em JBIG2 e CCITT já pesam quase nada.

Tudo acontece no navegador, o arquivo não é enviado a nenhum servidor. Um PDF protegido por senha abre depois que você digita a senha, e o arquivo comprimido é salvo sem senha.

## Perguntas frequentes

**Por que o arquivo quase não diminuiu?** Provavelmente ele tem poucas imagens: texto e gráficos vetoriais pesam pouco e já vêm comprimidos. Às vezes o peso vem das fontes incorporadas, que não dá para reduzir sem perdas.

**Como caber num limite, por exemplo de 2 MB?** Comece pelo nível médio. Se o arquivo ainda passar do limite, escolha o alto. Se ainda não bastar, experimente o modo "Como digitalização": ele redesenha as páginas como imagens. Outra opção é [dividir o PDF](/pt/pdf/split-pdf/) em várias partes.

**O que é melhor: comprimir o PDF ou as fotos antes de criar o PDF?** Se o PDF vai ser montado a partir de fotos, é mais prático [comprimir as fotos](/pt/images/compress-image/) antes. E o [conversor de JPG para PDF](/pt/pdf/jpg-to-pdf/) as incorpora sem comprimir de novo.
