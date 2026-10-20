## Was ist Base64?

Base64 ist eine Methode, beliebige Daten – Text, Bilder, Dateien – nur mit lateinischen Buchstaben, Ziffern und den Zeichen `+`, `/` und `=` darzustellen. Man nutzt sie überall, wo nur Text erlaubt ist: in E-Mails, JSON, Data-URLs und HTTP-Headern wie `Authorization: Basic`.

Base64 ist **eine Kodierung, keine Verschlüsselung**: Jeder kann es ohne Passwort dekodieren.

## So funktioniert's

Wählen Sie „Kodieren“ oder „Dekodieren“ und fügen Sie den Text ein – das Ergebnis erscheint sofort. Text wird als UTF-8 kodiert, Umlaute und Emojis funktionieren also korrekt. Beim Dekodieren werden auch die URL-sichere Variante (`-` und `_` statt `+` und `/`) und Zeichenketten ohne `=` am Ende akzeptiert. Für URLs, JWTs und Dateinamen gibt es „Kodieren (URL-safe)“: `-` und `_` statt `+` und `/`, ohne `=` am Ende.

## Beispiele

- `Hallo Welt` → `SGFsbG8gV2VsdA==`
- `aGVsbG8=` → `hello`

## Häufige Fragen

**Warum ist die kodierte Zeichenkette länger?** Je 3 Byte werden zu 4 Zeichen, die Größe wächst also um etwa ein Drittel.

**Was bedeuten die `=` am Ende?** Das ist Auffüllung: Mit Auffüllung ist die Länge ein Vielfaches von 4. Dieses Tool akzeptiert auch Zeichenketten ohne abschließende `=`.

**Warum gibt es beim Dekodieren einen Fehler?** Die Zeichenkette enthält ungültige Zeichen, oder die Daten sind kein Text (zum Beispiel ein Bild).

Für Links gibt es die [URL-Kodierung](/de/security/url-encode/).
