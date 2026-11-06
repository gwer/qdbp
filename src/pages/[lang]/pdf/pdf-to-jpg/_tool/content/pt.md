## Como usar

Escolha um PDF — aparecem as miniaturas das páginas. Depois configure:

- **Formato** — JPG serve para fotos, documentos escaneados e envio pelo WhatsApp. PNG é para diagramas, tabelas e texto: ele é sem perdas, as bordas das letras ficam nítidas, mas os arquivos são maiores.
- **Resolução** — 72 dpi bastam para ver na tela ou colocar numa apresentação. 150 dpi é a opção para quase tudo. 300 dpi é para impressão e letras pequenas. Uma página A4 a 150 dpi tem 1240×1754 pixels; a 300 dpi, 2480×3508.
- **Páginas** — campo vazio significa todas as páginas. Dá para indicar páginas avulsas e intervalos: `1-3, 7`. As páginas que não entram no resultado ficam apagadas nas miniaturas.

Clique em "Salvar" e baixe as imagens uma por uma ou todas juntas num ZIP. Os nomes dos arquivos trazem o número da página.

## Como funciona

Cada página é desenhada no navegador com o mesmo mecanismo que vem no Firefox (pdf.js) e salva como imagem. O arquivo não é enviado a nenhum servidor. Um PDF protegido por senha abre depois que você digita a senha.

O tamanho da imagem em pixels é o tamanho da página em polegadas multiplicado pela resolução. Páginas muito grandes, como plantas em formato A1 a 300 dpi, passam do limite que os navegadores de celular aceitam para uma única imagem (cerca de 16,7 megapixels). Essas páginas são salvas com resolução menor, e isso aparece escrito ao lado do arquivo.

## Perguntas frequentes

**Dá para tirar do PDF as fotos originais, e não imagens das páginas?** Esta ferramenta salva a página inteira, do jeito que ela aparece. Se a foto ocupa a página toda, como numa digitalização, o resultado é praticamente o mesmo. Para ter a foto sem margens, escolha uma resolução mais alta e corte a imagem.

**Por que o texto na imagem ficou borrado?** Provavelmente a resolução está baixa demais para letras pequenas. Escolha 300 dpi e o formato PNG.

**Como fazer o contrário — PDF a partir de imagens?** Para isso existe o [conversor de JPG para PDF](/pt/pdf/jpg-to-pdf/).

**Precisa só do texto do PDF?** Dá para [extrair o texto do PDF](/pt/pdf/pdf-to-text/) como texto comum, sem imagens.
