## Was ist eine UUID?

Eine UUID (auch GUID) ist ein 128-Bit-Bezeichner wie `550e8400-e29b-41d4-a716-446655440000`. Sie lässt sich überall ohne zentralen Zähler erzeugen, und die Wahrscheinlichkeit, dass zwei UUIDs gleich sind, ist verschwindend gering. UUIDs dienen als Datenbankschlüssel und als IDs für Bestellungen, Dateien und Ereignisse.

## v4 oder v7?

- **v4** ist vollständig zufällig (122 Zufallsbits) und passt fast immer.
- **v7** enthält in den ersten 48 Bit den Erstellungszeitpunkt in Millisekunden, der Rest ist zufällig (RFC 9562, 2024). v7-UUIDs sind zeitlich sortierbar und eignen sich daher besser als Primärschlüssel: Indizes wachsen der Reihe nach.

## So funktioniert's

Version und Anzahl wählen – die UUIDs erscheinen sofort. Auf Wunsch in Großbuchstaben oder ohne Bindestriche. Alles wird im Browser mit `crypto.getRandomValues` erzeugt.

## Häufige Fragen

**Kann sich eine UUID wiederholen?** Theoretisch ja, praktisch nein: Für eine 50-%-Chance auf ein einziges Duplikat müssten Sie etwa 2,7 Trillionen (2,7 × 10¹⁸) v4-UUIDs erzeugen.

**Was ist der Unterschied zwischen UUID und GUID?** Keiner – GUID ist der Microsoft-Name für dasselbe Format.

**Kann ich den Erstellungszeitpunkt einer v7-UUID auslesen?** Ja: Die ersten 12 Hexadezimalziffern sind die Zeit in Millisekunden seit dem 1. Januar 1970. Umrechnen lässt sie sich mit dem [Unix-Timestamp-Konverter](/de/dates/unix-timestamp/) im Millisekunden-Modus.
