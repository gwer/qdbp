## So funktioniert's

**Bild → Base64.** Bild hinzufügen und als Data-URL, reines Base64, fertige CSS-Regel oder `<img>`-Tag erhalten. Ergebnis kopieren und in den Code einfügen.

**Base64 → Bild.** Data-URL oder Base64-Zeichenkette einfügen – das Bild erscheint sofort und lässt sich herunterladen. Das Format wird am Inhalt erkannt, auch wenn im Kopf etwas anderes steht.

Alles läuft im Browser; die Datei wird nicht hochgeladen.

## Beispiel

Ein transparentes PNG mit 1 × 1 Pixel ist 70 Byte groß und sieht als Data-URL so aus:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==`

## Wofür man das braucht

- Kleine Icons und Bilder direkt in CSS oder HTML – ohne zusätzliche Anfrage an den Server.
- Bilder in JSON, E-Mails und Vorlagen, an die man keine Datei anhängen kann.
- Fehlersuche: sehen, welches Bild in einer Base64-Zeichenkette aus einer API oder Datenbank steckt.

## Häufige Fragen

**Warum ist Base64 größer als die Datei?** Je 3 Byte werden zu 4 Zeichen – die Größe wächst um etwa ein Drittel.

**Sollte ich große Fotos so einbetten?** Nein: Die Seite wird schwerer, und der Browser kann das Bild nicht separat zwischenspeichern. Data-URLs eignen sich für Dateien von wenigen Kilobyte. Große Bilder besser [komprimieren](/de/images/compress-image/) und normal verlinken.

**Ist Base64 eine Verschlüsselung?** Nein, nur eine andere Schreibweise derselben Daten – jeder kann sie dekodieren. Für Text gibt es die [Base64-Kodierung](/de/security/base64/).
