## Para que codificar uma URL

Em uma URL só são permitidos letras latinas, números e alguns sinais. Espaços, acentos, ç e `&`, `=`, `?`, `#` dentro de um parâmetro precisam ser escritos como `%XX` — é a codificação percentual. O navegador faz isso sozinho, mas quando você monta links à mão, em código ou em parâmetros UTM, precisa codificar os valores.

## Como usar

Escolha "Codificar" para deixar o texto seguro para URL ou "Decodificar" para tornar legível um link cheio de `%XX`.

## Exemplos

- `preço & ação` → `pre%C3%A7o%20%26%20a%C3%A7%C3%A3o`
- `price%20%26%20size` → `price & size`

## Perguntas frequentes

**Por que o espaço às vezes é `%20` e às vezes `+`?** Em strings de consulta de formulários o espaço é tradicionalmente `+`; no restante da URL, `%20`. Na decodificação, `+` é tratado como espaço; na codificação usamos sempre `%20`, que funciona em qualquer lugar.

**A `/` é codificada?** No modo «Codificar», sim: codifica-se como o valor de um parâmetro (`encodeURIComponent`), então `/`, `?`, `&` e `=` viram `%XX`. Para uma URL inteira, escolha «Codificar URL inteira» (`encodeURI`): os caracteres da URL ficam, e espaços e acentos são codificados.

Para dados em geral, use o [Base64](/pt/security/base64/).
