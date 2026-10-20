## So funktioniert's

JSON einfügen – es wird sofort mit Einrückung formatiert. Enthält es einen Fehler, sehen Sie die genaue Zeile und Spalte. Modi:

- **2 oder 4 Leerzeichen, Tabulatoren** – zum Lesen und Einfügen in Code;
- **Schlüssel sortieren** – Objektschlüssel auf allen Ebenen alphabetisch, praktisch zum Vergleichen zweier JSON-Dokumente;
- **Minifizieren** – alles in einer Zeile ohne überflüssige Leerzeichen, für APIs und Konfigurationsdateien.

Die Daten werden im Browser verarbeitet und nirgendwohin gesendet – Sie können also auch JSON mit Tokens oder persönlichen Daten prüfen.

## Häufige JSON-Fehler

- **Einfache Anführungszeichen:** `{'a': 1}` – in JSON stehen Zeichenketten und Schlüssel in doppelten Anführungszeichen.
- **Komma nach dem letzten Element:** `[1, 2,]` – in JSON nicht erlaubt (in JavaScript schon).
- **Schlüssel ohne Anführungszeichen:** `{a: 1}` – das ist JavaScript, kein JSON.
- **Kommentare** `//` und `/* */` – gibt es in Standard-JSON nicht.
- **Führende Nullen** wie `01`, `NaN` und `undefined` – ungültige Werte.

## Häufige Fragen

**Warum werden Umlaute nicht als `ü` maskiert?** Das ist nicht nötig: JSON ist per Definition UTF-8.

**Gibt es eine Größenbeschränkung?** Nur den Speicher Ihres Geräts; Dateien mit mehreren Megabyte sind in Sekundenbruchteilen verarbeitet.

Um JSON für eine URL oder als Base64 zu kodieren, nutzen Sie die [URL-Kodierung](/de/security/url-encode/) oder [Base64](/de/security/base64/).
