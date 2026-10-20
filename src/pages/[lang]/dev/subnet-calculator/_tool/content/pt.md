## Como usar

Digite um endereço IP com prefixo (`192.168.1.10/24`) ou com máscara (`10.0.0.0 255.255.0.0`). Você vê o endereço de rede, a máscara e a máscara curinga, o broadcast, a faixa de endereços para hosts e quantos cabem.

Para dividir uma rede, escolha um novo prefixo em «Dividir em sub-redes» — por exemplo, uma /24 em quatro /26 — e veja a rede, a faixa e o broadcast de cada uma. O endereço e a máscara também aparecem em binário: dá para ver quais bits são da rede e quais dos hosts.

## Exemplo

`192.168.1.10/24`:

- rede `192.168.1.0/24`, máscara `255.255.255.0`;
- broadcast `192.168.1.255`;
- faixa de hosts `192.168.1.1 – 192.168.1.254` — **254** endereços utilizáveis.

## Como é calculado

`/24` significa que os primeiros 24 bits identificam a rede e os 8 restantes, o host. São 2⁸ = 256 endereços, mas o primeiro (rede) e o último (broadcast) não vão para dispositivos, restando 254. Em `/31` (enlaces ponto a ponto, RFC 3021) e `/32` (um único endereço), esses dois não são descontados.

## Perguntas frequentes

**O que são redes privadas?** `10.0.0.0/8`, `172.16.0.0/12` e `192.168.0.0/16` (RFC 1918) são usadas em redes domésticas e de escritório e não são roteadas na internet.

**Para que serve a máscara curinga?** É usada em ACLs da Cisco e no OSPF: bits em 1 significam "qualquer valor".

**Tem suporte a IPv6?** Ainda não — só IPv4.
