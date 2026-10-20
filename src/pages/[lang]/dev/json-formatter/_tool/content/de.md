## So funktioniert's

JSON einfügen – es wird sofort mit Einrückung formatiert. Enthält es einen Fehler, sehen Sie die genaue Zeile und Spalte. Modi:

- **2 oder 4 Leerzeichen, Tabulatoren** – zum Lesen und Einfügen in Code;
- **Schlüssel sortieren** – Objektschlüssel auf allen Ebenen alphabetisch, praktisch zum Vergleichen zweier JSON-Dokumente;
- **Minifizieren** – alles in einer Zeile ohne überflüssige Leerzeichen, für APIs und Konfigurationsdateien.

„Reparieren“ korrigiert „fast JSON“ – Konfigurationen, JavaScript-Objekte, Python-Ausgaben: entfernt Kommentare und hängende Kommas, ersetzt einfache durch doppelte Anführungszeichen, setzt Schlüssel in Anführungszeichen und macht aus True/False/None true/false/null. Heraus kommt striktes, formatiertes JSON.

Die Daten werden im Browser verarbeitet und nirgendwohin gesendet – Sie können also auch JSON mit Tokens oder persönlichen Daten prüfen.

## Häufige JSON-Fehler

- **Einfache Anführungszeichen:** `{'a': 1}` – in JSON stehen Zeichenketten und Schlüssel in doppelten Anführungszeichen.
- **Komma nach dem letzten Element:** `[1, 2,]` – in JSON nicht erlaubt (in JavaScript schon).
- **Schlüssel ohne Anführungszeichen:** `{a: 1}` – das ist JavaScript, kein JSON.
- **Kommentare** `//` und `/* */` – gibt es in Standard-JSON nicht.
- **Führende Nullen** wie `01`, `NaN` und `undefined` – ungültige Werte.

## Häufige Fragen

**Warum wird `ü` nicht als `\u00fc` geschrieben?** Dieses Zeichen darf in JSON direkt stehen; die Unicode-Escape-Sequenz ist optional.

**Gibt es eine Größenbeschränkung?** Die verarbeitbare Größe hängt vom verfügbaren Arbeitsspeicher und der Leistung Ihres Geräts ab. Große Dokumente können länger dauern.

**Können sich Zahlen ändern?** Sehr große Ganzzahlen und Dezimalzahlen mit vielen Stellen ja: Der Browser speichert JSON-Zahlen mit etwa 15–17 signifikanten Stellen. So wird aus `9007199254740993` die Zahl `9007199254740992`. Enthalten Ihre Daten solche IDs oder Beträge, speichern Sie sie als Strings.

Um JSON für eine URL oder als Base64 zu kodieren, nutzen Sie die [URL-Kodierung](/de/security/url-encode/) oder [Base64](/de/security/base64/).
