## O que é um UUID

Um UUID (também chamado de GUID) é um identificador de 128 bits como `550e8400-e29b-41d4-a716-446655440000`. Ele pode ser criado em qualquer lugar sem um contador central, e a chance de dois coincidirem é ínfima. UUIDs são usados como chaves em bancos de dados e como IDs de pedidos, arquivos e eventos.

## v4 ou v7?

- **v4** é totalmente aleatório (122 bits aleatórios) e serve quase sempre.
- **v7** guarda nos primeiros 48 bits o horário de criação em milissegundos e o resto é aleatório (RFC 9562, 2024). Eles ficam ordenados por data de criação e funcionam melhor como chaves primárias: os índices crescem em ordem.

## Como usar

Escolha a versão e a quantidade — os UUIDs aparecem na hora. Dá para usar maiúsculas ou tirar os hífens. Tudo é gerado no navegador com `crypto.getRandomValues`.

## Perguntas frequentes

**Um UUID pode se repetir?** Em teoria sim, na prática não: seria preciso gerar cerca de 2,7 quintilhões (2,7 × 10¹⁸) de UUIDs v4 para ter 50% de chance de uma única repetição.

**Qual é a diferença entre UUID e GUID?** Nenhuma — GUID é o nome usado pela Microsoft para o mesmo formato.

**Dá para saber quando um UUID v7 foi criado?** Sim: os 12 primeiros dígitos hexadecimais são o horário em milissegundos desde 1º de janeiro de 1970. Converta com o [conversor de Unix timestamp](/pt/dates/unix-timestamp/) no modo milissegundos.
