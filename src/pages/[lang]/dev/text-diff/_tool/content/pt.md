## Como usar

Cole o texto original em "Original" e a versão nova em "Alterado". As diferenças aparecem na hora:

«Ignorar espaços» e «Ignorar maiúsculas» deixam de fora espaços extras, recuos e diferenças de maiúsculas: aparecem só as mudanças de conteúdo.

- **em vermelho**, as linhas que não estão no segundo texto (removidas);
- **em verde**, as que não estavam no primeiro (adicionadas);
- uma linha alterada aparece como o par "removida + adicionada", com as palavras e os sinais que mudaram destacados com mais força.

Acima do resultado fica a contagem de linhas adicionadas e removidas. A visualização **Lado a lado** coloca os textos em duas colunas; a **Unificada** mostra as mudanças uma depois da outra, como o `git diff`. No celular o resultado é sempre unificado, porque duas colunas não cabem. Trechos longos sem mudanças são recolhidos até três linhas em volta de cada alteração; desmarque "Ocultar linhas iguais" para ver tudo.

Os textos são comparados no seu navegador e não são enviados a lugar nenhum: dá para comparar contratos, configurações e código.

## Exemplo

| Original | Alterado |
|---|---|
| Lista de compras: | Lista de compras: |
| leite — 2 litros | leite — 1 litro |
| pão | pão |
| ovos — 1 dúzia | ovos — 1 dúzia |
| queijo | café |
| café | açúcar |

Resultado: 2 linhas adicionadas e 2 removidas. A linha do leite mudou e dentro dela ficam destacados "2 litros" e "1 litro". O queijo foi removido, o açúcar foi adicionado e as demais linhas coincidem. Este exemplo já vem preenchido na ferramenta.

## Como funciona

Os dois textos são divididos em linhas e a ferramenta procura o **menor conjunto de alterações**: o mínimo de linhas removidas e adicionadas que transforma o primeiro texto no segundo. É o algoritmo de Myers, o mesmo que o `git diff` usa por padrão. Dentro de cada par de linhas alteradas, palavras, espaços e pontuação são comparados do mesmo jeito.

Se duas linhas não têm nenhuma palavra em comum, o destaque interno não ajuda, então elas aparecem simplesmente como removida e adicionada.

## Perguntas frequentes

**Por que um parágrafo que eu mudei de lugar aparece como removido e adicionado?** A comparação procura uma sequência comum de linhas na ordem original. Um bloco movido não consegue ficar no lugar dentro dessa sequência, então aparece removido na posição antiga e adicionado na nova.

**Não vejo diferença nenhuma, mas as linhas aparecem como alteradas.** Provavelmente é um caractere invisível: espaço no fim da linha, tabulação no lugar de espaços, espaço não separável. Quebras de linha diferentes (Windows `\r\n` e Unix `\n`) não contam como diferença. Para tirar os espaços das pontas de cada linha, use as [ferramentas de linhas](/pt/text/line-tools/).

**Funciona com textos grandes?** Sim: textos com dezenas de milhares de linhas são comparados em uma fração de segundo, desde que não haja diferenças demais. Textos grandes completamente diferentes demoram mais.

**Dá para comparar dois JSON?** Dá, mas antes passe os dois pelo [formatador de JSON](/pt/dev/json-formatter/) com as chaves ordenadas: assim só sobram as diferenças reais, e não as de recuo ou ordem dos campos.
