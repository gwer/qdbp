## So funktioniert der Generator

Wählen Sie Länge und Zeichenarten – das Passwort erscheint sofort. „Neu erzeugen“ liefert ein neues, „Kopieren“ legt es in die Zwischenablage.

Das Passwort wird direkt im Browser mit einem kryptografisch sicheren Zufallsgenerator (`crypto.getRandomValues`) erzeugt. Es wird an keinen Server gesendet und nirgends gespeichert.

## Wie lang sollte ein Passwort sein?

Am wichtigsten ist die Länge. Bei Zufallspasswörtern misst man die Sicherheit als Entropie – wie viele Bit Zufall darin stecken:

- 8 Zeichen aus Buchstaben und Ziffern – etwa **48 Bit**: mittel;
- 12 Zeichen aus allen Zeichenarten – etwa **78 Bit**: stark;
- 16 Zeichen aus allen Zeichenarten – etwa **104 Bit**: sehr stark.

Für wichtige Konten sind 14–16 Zeichen oder mehr sinnvoll – mit einem Passwort-Manager müssen Sie sie sich nicht merken.

## Häufige Fragen

**Wozu „ohne ähnliche Zeichen“?** Wenn Sie das Passwort einmal abtippen müssen, verwechselt man l und 1 oder O und 0 leicht. Die Sicherheit leidet kaum.

**Kann ich ein Passwort für mehrere Websites nutzen?** Besser nicht: Wird es bei einem Dienst geleakt, sind alle Konten mit diesem Passwort gefährdet.

**Warum enthält jedes Passwort jede gewählte Zeichenart?** Viele Websites verlangen mindestens eine Ziffer, einen Großbuchstaben usw. – der Generator stellt das sicher.
