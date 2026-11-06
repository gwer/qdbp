## So funktioniert's

Wählen Sie den Algorithmus, tragen Sie die Token-Daten (Payload) als JSON und das Secret ein – das fertige Token erscheint darunter und lässt sich kopieren. Der Header entsteht automatisch: `{"alg":"HS256","typ":"JWT"}` mit dem gewählten Algorithmus.

Das Token wird im Browser erstellt, Secret und Daten werden nirgendwohin gesendet. Das voreingestellte Beispiel ist dasselbe Token wie im [JWT-Decoder](/de/dev/jwt-decoder/) – dort können Sie auch die Signatur des erstellten Tokens prüfen.

Signiert wird nur mit gemeinsamem Secret (HS256, HS384, HS512). RS- und ES-Signaturen mit privatem Schlüssel werden hier nicht erstellt.

## Das Secret

Das Secret wird als UTF-8-Text verwendet – so behandeln es die meisten Bibliotheken, wenn es als String angegeben ist. Speichert Ihr Dienst das Secret in Base64 oder Hex, passt die Signatur mit diesem String nicht: Der Dienst signiert mit den dekodierten Bytes.

RFC 7518 verlangt einen Schlüssel, der mindestens so lang ist wie die Hash-Ausgabe: 32 Bytes für HS256, 48 für HS384, 64 für HS512. Ist das Secret kürzer, erscheint ein Hinweis. Ein lateinischer Buchstabe ist 1 Byte, Umlaute und ß sind 2. Ein langes zufälliges Secret liefert der [Passwort-Generator](/de/security/password-generator/).

## So entsteht das Token

1. Header und Payload werden als JSON ohne Leerzeichen geschrieben und in Base64URL kodiert (Base64, bei dem `+` und `/` durch `-` und `_` ersetzt und `=` am Ende weggelassen werden).
2. Beide Teile werden mit einem Punkt verbunden, über diesen String wird mit dem gewählten Hash (SHA-256, SHA-384 oder SHA-512) und dem Secret ein HMAC berechnet.
3. Die Signatur in Base64URL wird als dritter Teil angehängt: `Header.Payload.Signatur`.

Das Beispiel von jwt.io: Algorithmus HS256, Payload `{"sub":"1234567890","name":"John Doe","iat":1516239022}`, Secret `your-256-bit-secret`. Heraus kommt

`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

Das Secret in diesem Beispiel hat 19 Bytes, daher erscheint der Hinweis, dass es für HS256 zu kurz ist.

## Häufige Fragen

**Wie lege ich ein Ablaufdatum fest?** Mit `exp` (läuft ab), `nbf` (gültig ab) und `iat` (ausgestellt) – in Unix-Sekunden, nicht Millisekunden. Ein Datum in Sekunden umrechnen können Sie im [Unix-Timestamp-Konverter](/de/dev/unix-timestamp/).

**Ist die Payload verschlüsselt?** Nein, nur kodiert: Jeder, der das Token hat, kann sie lesen. Legen Sie keine Passwörter oder personenbezogenen Daten ins Token – die Signatur schützt vor Fälschung, nicht vor dem Lesen.

**Warum unterscheidet sich mein Token von dem meines Servers mit denselben Daten?** Die Signatur hängt von jedem Byte ab: Reihenfolge der Felder, Leerzeichen im JSON, zusätzliche Header-Felder wie `kid`. Dieses Tool schreibt JSON ohne Leerzeichen und behält die Felder in der eingegebenen Reihenfolge. Der Server prüft die Signatur über das Token selbst und akzeptiert es trotzdem, wenn Secret und Algorithmus stimmen.

**Große Zahlen ändern sich.** Ganze Zahlen über 9.007.199.254.740.991 speichert der Browser nicht exakt – solche Werte in der Payload besser als String schreiben.
