## Como usar

Defina o intervalo "de" e "até" (os dois números entram no sorteio), quantos números você quer e se podem repetir. Clique em "Sortear": a cada vez sai um resultado novo.

## Sorteio justo

Os números são gerados no seu navegador por um gerador criptográfico (`crypto.getRandomValues`). Todos os números do intervalo têm exatamente a mesma chance: a calculadora descarta os poucos valores que, de outra forma, favoreceriam levemente os números menores.

## Exemplos

- Jogar um dado: de 1 a 6, um número.
- Sortear o ganhador de uma rifa com 250 números: de 1 a 250, um número.
- Três ganhadores sem repetir: de 1 a 250, três números, "Sem repetir".
- Um jogo da Mega-Sena: de 1 a 60, seis números sem repetir, em ordem crescente.

## Perguntas frequentes

**Dá para prever ou manipular o resultado?** Não. O gerador não usa o relógio nem outros dados previsíveis, e os resultados não ficam salvos em lugar nenhum.

**Quantos números posso sortear de uma vez?** Até 1.000. Sem repetição, no máximo a quantidade de números do intervalo.

**Funciona com números negativos?** Sim, por exemplo de −10 a 10.
