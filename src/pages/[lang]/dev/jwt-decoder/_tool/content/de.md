## So funktioniert's

Fügen Sie das Token in das Feld ein – allein oder mit dem Präfix `Authorization: Bearer …`, auch mit Zeilenumbrüchen. Der Decoder zeigt sofort:

- **den Header** – Signaturalgorithmus (`alg`), Typ (`typ`) und manchmal die Schlüssel-ID (`kid`);
- **die Payload** – alle Claims des Tokens als formatiertes JSON;
- **die Zeiten `iat`, `nbf` und `exp`** – als Datum und Uhrzeit in der Zeitzone Ihres Geräts und relativ zu jetzt: „in 3 Tagen“, „vor 2 Stunden“;
- **den Status** – ob das Token abgelaufen ist;
- **die Signatur** – unverändert als Base64URL-Zeichenkette.

Das Token wird im Browser dekodiert und nicht hochgeladen. Behandeln Sie echte Zugangstokens vertraulich: Ein offengelegtes, gültiges Bearer-Token kann im Rahmen seiner Berechtigungen bis zum Ablauf oder Widerruf Zugriff ermöglichen. Das Dekodieren bestätigt nicht die Gültigkeit.

## Die Signatur wird nicht geprüft

Der Decoder zeigt den Inhalt, prüft aber die Signatur nicht – dafür braucht man den geheimen oder öffentlichen Schlüssel des Servers. Die Payload eines normalen JWT ist nicht verschlüsselt, sondern nur Base64URL-kodiert: Lesen kann sie jeder, fälschen ohne Schlüssel niemand. Deshalb:

- keine Passwörter und personenbezogenen Daten in Tokens speichern;
- nichts auf Claims stützen, bevor der Server die Signatur geprüft hat;
- ein Token mit `"alg": "none"` und leerem dritten Teil ist völlig ungeschützt.

## Aufbau eines JWT

Ein Token besteht aus drei durch Punkte getrennten Teilen: `Header.Payload.Signatur`. Die ersten beiden sind Base64URL-kodiertes JSON (Base64, bei dem `+` und `/` durch `-` und `_` ersetzt und die `=` am Ende weggelassen werden). Das Beispiel aus RFC 7519:

`eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`

Der Header lautet `{"typ":"JWT","alg":"HS256"}`, die Payload `{"iss":"joe","exp":1300819380,"http://example.com/is_root":true}`. Der `exp`-Wert 1300819380 entspricht dem 22. März 2011, 18:43 UTC – das Token ist also längst abgelaufen.

## Registrierte Claims

| Claim | Bedeutung |
|---|---|
| `iss` | Aussteller des Tokens |
| `sub` | Subjekt – meist die Benutzer-ID |
| `aud` | Zielgruppe – für welchen Dienst das Token bestimmt ist |
| `exp` | Ablaufzeit (ab diesem Moment ungültig) |
| `nbf` | gültig ab |
| `iat` | Ausstellungszeitpunkt |
| `jti` | eindeutige Token-ID, damit es sich widerrufen lässt |

`exp`, `nbf` und `iat` sind Unix-Timestamps in Sekunden. Jede solche Zahl wandelt der [Unix-Timestamp-Konverter](/de/dates/unix-timestamp/) in ein Datum um.

## Häufige Fehler

- **„Drei durch Punkte getrennte Teile“** – das Token wurde unvollständig oder mit zusätzlichem Text kopiert, typischerweise eine abgeschnittene Zeile aus einem Log.
- **Fünf Teile** – das ist ein JWE, ein verschlüsseltes Token. Ohne Schlüssel lässt es sich nicht lesen, und das ist so gewollt.
- **„Kein gültiges Base64URL“** – Anführungszeichen, Auslassungspunkte oder andere fremde Zeichen sind ins Token geraten.

## Häufige Fragen

**Warum steht „abgelaufen“ da, obwohl der Server das Token noch akzeptiert?** Server tolerieren oft ein paar Minuten Uhrenabweichung (Leeway). Prüfen Sie auch die Uhr Ihres Geräts: Der Status wird danach berechnet.

**Kann ich die Payload ändern und das Token zurückschicken?** Ändern ja, aber dann passt die Signatur nicht mehr, und jeder Server, der sie prüft, lehnt das Token ab.

**Wie dekodiere ich eine beliebige Base64-Zeichenkette?** Dafür gibt es den [Base64-Decoder](/de/security/base64/); großes JSON liest sich am besten im [JSON-Formatierer](/de/dev/json-formatter/).
