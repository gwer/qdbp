## So funktioniert's

Fügen Sie den ursprünglichen Text in „Vorher“ und die neue Fassung in „Nachher“ ein. Die Unterschiede erscheinen sofort:

- **rot** – Zeilen, die im zweiten Text fehlen (entfernt);
- **grün** – Zeilen, die im ersten Text nicht vorkamen (hinzugefügt);
- eine geänderte Zeile erscheint als Paar „entfernt + hinzugefügt“, die abweichenden Wörter und Zeichen darin sind kräftiger markiert.

Über dem Ergebnis steht die Zahl der hinzugefügten und entfernten Zeilen. Die Ansicht **Nebeneinander** zeigt die Texte in zwei Spalten, **Untereinander** listet die Änderungen nacheinander auf wie `git diff`. Auf dem Smartphone wird das Ergebnis immer untereinander gezeigt, weil zwei Spalten nicht passen. Lange unveränderte Abschnitte werden bis auf drei Zeilen um jede Änderung eingeklappt – entfernen Sie den Haken bei „Unveränderte Zeilen ausblenden“, um alles zu sehen.

Die Texte werden im Browser verglichen und nirgendwohin gesendet: Sie können also auch Verträge, Konfigurationen und Code vergleichen.

## Beispiel

| Vorher | Nachher |
|---|---|
| Einkaufsliste: | Einkaufsliste: |
| Milch – 2 Liter | Milch – 1 Liter |
| Brot | Brot |
| Eier – 10 Stück | Eier – 10 Stück |
| Käse | Kaffee |
| Kaffee | Zucker |

Ergebnis: 2 Zeilen hinzugefügt, 2 entfernt. Die Zeile mit der Milch hat sich geändert, darin sind „2“ und „1“ markiert. „Käse“ wurde entfernt, „Zucker“ hinzugefügt, die übrigen Zeilen stimmen überein. Dieses Beispiel ist im Tool vorausgefüllt.

## Wie es funktioniert

Beide Texte werden in Zeilen zerlegt, und das Tool sucht die **kürzeste Folge von Änderungen** – möglichst wenige entfernte und hinzugefügte Zeilen, die den ersten Text in den zweiten überführen. Das ist der Myers-Algorithmus, den auch `git diff` standardmäßig verwendet. Innerhalb jedes Paars geänderter Zeilen werden Wörter, Leerzeichen und Satzzeichen auf dieselbe Weise verglichen.

Haben zwei Zeilen kein einziges gemeinsames Wort, hilft eine Markierung darin nicht weiter – sie erscheinen dann einfach als entfernt und hinzugefügt.

## Häufige Fragen

**Warum wird ein verschobener Absatz als entfernt und hinzugefügt angezeigt?** Der Vergleich sucht eine gemeinsame Folge von Zeilen in ihrer ursprünglichen Reihenfolge. Ein verschobener Block kann darin nicht an seinem Platz bleiben, deshalb erscheint er an der alten Stelle als entfernt und an der neuen als hinzugefügt.

**Ich sehe keinen Unterschied, aber die Zeilen sind als geändert markiert.** Meist steckt ein unsichtbares Zeichen dahinter: ein Leerzeichen am Zeilenende, ein Tab statt Leerzeichen, ein geschütztes Leerzeichen. Unterschiedliche Zeilenumbrüche (Windows `\r\n` und Unix `\n`) zählen nicht als Unterschied. Leerzeichen am Zeilenanfang und -ende entfernt das [Zeilen-Werkzeug](/de/text/line-tools/).

**Eignet sich das für große Texte?** Ja: Texte mit Zehntausenden Zeilen werden in Sekundenbruchteilen verglichen, solange es nicht zu viele Unterschiede gibt. Große, völlig verschiedene Texte dauern länger.

**Kann ich zwei JSON-Dateien vergleichen?** Ja, aber bringen Sie beide vorher im [JSON-Formatierer](/de/dev/json-formatter/) mit sortierten Schlüsseln in dieselbe Form – dann bleiben nur echte Unterschiede übrig, nicht Einrückung oder Reihenfolge der Felder.
