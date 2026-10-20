## So funktioniert's

IP-Adresse mit Präfix (`192.168.1.10/24`) oder mit Maske (`10.0.0.0 255.255.0.0`) eingeben. Sie erhalten Netzadresse, Subnetz- und Wildcard-Maske, Broadcast-Adresse, den nutzbaren Host-Bereich und die Anzahl der Hosts.

Um ein Netz aufzuteilen, wählen Sie unter „In Subnetze aufteilen“ ein neues Präfix – etwa ein /24 in vier /26 – und sehen Netz, Bereich und Broadcast jedes Subnetzes. Adresse und Maske werden auch binär angezeigt: So sieht man, welche Bits zum Netz und welche zu den Hosts gehören.

## Beispiel

`192.168.1.10/24`:

- Netz `192.168.1.0/24`, Maske `255.255.255.0`;
- Broadcast `192.168.1.255`;
- Host-Bereich `192.168.1.1 – 192.168.1.254` – **254** nutzbare Adressen.

## Wie gerechnet wird

`/24` bedeutet: Die ersten 24 Bit bezeichnen das Netz, die übrigen 8 den Host. Das sind 2⁸ = 256 Adressen, doch die erste (Netzadresse) und die letzte (Broadcast) werden keinem Gerät zugewiesen – bleiben 254. Bei `/31` (Punkt-zu-Punkt, RFC 3021) und `/32` (eine Adresse) werden diese beiden nicht abgezogen.

## Häufige Fragen

**Was sind private Netze?** `10.0.0.0/8`, `172.16.0.0/12` und `192.168.0.0/16` (RFC 1918) werden in Heim- und Firmennetzen genutzt und im Internet nicht geroutet.

**Wofür ist die Wildcard-Maske?** Sie wird in Cisco-ACLs und bei OSPF verwendet: Bits mit 1 bedeuten „beliebiger Wert“.

**Wird IPv6 unterstützt?** Noch nicht – nur IPv4.
