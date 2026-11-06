## So funktioniert's

Wählen Sie ein PDF und legen Sie ein Passwort fest. Klicken Sie auf „PDF schützen“ und laden Sie die Datei herunter: Jedes Programm – Browser, Acrobat, PDF-App auf dem Handy – fragt nun nach dem Passwort, bevor es den Inhalt zeigt.

Zusätzlich können Sie einschränken, was jemand darf, der die Datei mit dem Passwort geöffnet hat: drucken, Text kopieren, ändern. Für Einschränkungen braucht es ein zweites Passwort – das Besitzerpasswort. Es hebt die Einschränkungen auf und muss sich daher vom Passwort zum Öffnen unterscheiden.

Notieren Sie das Passwort. Wiederherstellen lässt es sich nicht: Wir sehen und speichern es nicht, und ein Passwort für AES-256 durch Ausprobieren zu knacken ist praktisch unmöglich.

## Wie es funktioniert

Der Inhalt der Datei wird mit AES-256 verschlüsselt – der stärksten Variante, die der PDF-Standard (ISO 32000-2) vorsieht. Unterstützt wird sie von Acrobat Reader ab Version X, von Browsern und aktuellen PDF-Apps auf Smartphones.

Die Verschlüsselung läuft im Browser: Weder die Datei noch das Passwort werden irgendwohin gesendet.

Einschränkungen für Drucken und Kopieren sind – anders als das Passwort zum Öffnen – eine Vereinbarung, keine Verschlüsselung. Acrobat und die meisten Programme halten sich daran, manche PDF-Viewer ignorieren sie aber. Für wirklich vertrauliche Dokumente sollten Sie sich nicht darauf verlassen: Schutz bietet nur das Passwort zum Öffnen.

## Häufige Fragen

**Welches Passwort soll ich wählen?** Ein langes: Die Sicherheit hängt vor allem von der Länge ab. Ein Satz aus vier bis fünf zufälligen Wörtern ist sicherer als eine kurze Zeichenfolge. Einen solchen erstellt der [Passwort-Generator](/de/security/password-generator/).

**Wie entferne ich das Passwort später?** Öffnen Sie die Datei mit der [PDF-Entsperrung](/de/pdf/unlock-pdf/) und geben Sie das Passwort ein.

**Bleiben Lesezeichen und Formulare erhalten?** Ja, das Dokument wird als Ganzes so verschlüsselt, wie es ist; nichts wird entfernt.
