## Como usar

Adicione suas fotos HEIC — arraste, escolha os arquivos ou cole da área de transferência. No primeiro arquivo, o navegador carrega uma única vez o decodificador HEIC (cerca de 0,5 MB); depois os arquivos são convertidos um após o outro. Baixe os JPGs um por um ou todos num ZIP.

As dimensões em pixels não mudam e a rotação da foto é aplicada. A qualidade padrão é 90% — a olho nu, quase igual ao original. Se precisar de PNG (sem perdas) ou WebP, escolha na lista.

As fotos são processadas no seu navegador e não são enviadas para lugar nenhum.

## Por que o iPhone tira fotos em HEIC

Desde o iOS 11, a câmera do iPhone salva as fotos em HEIC por padrão — o formato HEIF com compressão HEVC (H.265). Com a mesma qualidade, o arquivo fica bem menor que um JPG, e cabem mais fotos no celular. Mas o Windows sem extensões extras, muitos sites, serviços de e-mail e programas antigos não abrem HEIC — por isso é preciso converter.

## Como fazer o iPhone salvar em JPG

- **Ajustes → Câmera → Formatos → "Mais Compatível".** As novas fotos serão salvas em JPG (e os vídeos em H.264). As que você já tirou continuam em HEIC.
- **Ajustes → Fotos → "Transferir para Mac ou PC" → "Automático".** Ao copiar as fotos para o computador pelo cabo, o iPhone as converte para JPG, e no celular elas continuam em HEIC.

## Perguntas frequentes

**A data e a localização são mantidas?** Não. Os metadados EXIF — modelo do celular, data, coordenadas de GPS — não passam para o novo arquivo. Isso é útil se a foto for publicada. Para ver o que uma foto guarda, use o [visualizador de EXIF](/pt/images/exif/).

**A foto vai ficar deitada?** Não. O iPhone guarda a rotação separada da imagem; o conversor a aplica e o JPG já sai na orientação certa.

**E as Live Photos e as fotos em sequência?** É convertida a foto principal. O vídeo da Live Photo é um arquivo .MOV separado e não entra aqui. Se um HEIC tiver várias imagens, é usada a marcada como principal.

**Por que o JPG pode ficar maior que o HEIC original?** O HEIC comprime de forma mais eficiente, então com qualidade alta o JPG costuma sair maior. Para diminuir o arquivo, reduza a qualidade para 80–85% ou passe os JPGs pelo [compressor de imagens](/pt/images/compress-image/).

**Há limites?** Até 50 MB por arquivo e 100 megapixels por imagem — fotos de 48 MP do iPhone Pro passam sem problema. Se um arquivo não for HEIC, estiver danificado ou faltar memória no navegador, esse arquivo mostra um aviso e os demais são convertidos normalmente.

**Como abrir HEIC no Windows sem converter?** No Windows 10 e 11, instale pela Microsoft Store as "Extensões de Imagem HEIF" e as "Extensões de Vídeo HEVC". Se você só precisa enviar ou publicar a foto, é mais rápido convertê-la para JPG aqui.

Para JPG, PNG e WebP, use o [conversor de imagens](/pt/images/convert-image/).

O decodificador HEIC usa as bibliotecas livres libheif e libde265, sob a licença LGPL-3.0: [licença e código-fonte](/licenses/libheif.txt).
