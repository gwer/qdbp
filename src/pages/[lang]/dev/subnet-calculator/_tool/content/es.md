## Cómo usarla

Escribe una dirección IP con prefijo (`192.168.1.10/24`) o con máscara (`10.0.0.0 255.255.0.0`). Verás la dirección de red, la máscara y la wildcard, la dirección de broadcast, el rango de direcciones para hosts y cuántos caben.

Para dividir una red, elige un nuevo prefijo en «Dividir en subredes» —por ejemplo, una /24 en cuatro /26— y verás la red, el rango y el broadcast de cada una. La dirección y la máscara también aparecen en binario: se ve qué bits son de red y cuáles de host.

## Ejemplo

`192.168.1.10/24`:

- red `192.168.1.0/24`, máscara `255.255.255.0`;
- broadcast `192.168.1.255`;
- rango de hosts `192.168.1.1 – 192.168.1.254`: **254** direcciones utilizables.

## Cómo se calcula

`/24` significa que los primeros 24 bits identifican la red y los 8 restantes, el host. Son 2⁸ = 256 direcciones, pero la primera (red) y la última (broadcast) no se asignan a equipos, así que quedan 254. En `/31` (enlaces punto a punto, RFC 3021) y `/32` (una sola dirección) no se restan.

## Preguntas frecuentes

**¿Qué son las redes privadas?** `10.0.0.0/8`, `172.16.0.0/12` y `192.168.0.0/16` (RFC 1918) se usan dentro de redes domésticas y de oficina y no se enrutan en internet.

**¿Para qué sirve la máscara wildcard?** Se usa en las ACL de Cisco y en OSPF: los bits a 1 significan «cualquier valor».

**¿Admite IPv6?** Todavía no, solo IPv4.
