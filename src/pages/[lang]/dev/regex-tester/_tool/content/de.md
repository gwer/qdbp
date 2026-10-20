## So funktioniert's

Geben Sie den regulären Ausdruck ohne die umschließenden Schrägstriche ein und fügen Sie Ihren Text ein. Der Tester zeigt sofort:

- alle Treffer farbig markiert im Text (benachbarte abwechselnd, leere als dünner Strich);
- ihre Anzahl und eine Tabelle mit der Position jedes Treffers (ab null, wie `index` in JavaScript) und den Gruppen – Nummer, Name bei benannten Gruppen und `—`, wenn eine Gruppe nicht beteiligt war;
- bei aktivem **Ersetzen** das Ergebnis von `text.replace(regex, ersetzung)` zum Kopieren.

Es arbeitet die Regex-Engine Ihres eigenen Browsers, die Ergebnisse stimmen also genau mit Ihrem JavaScript- oder TypeScript-Code überein. Ohne das Flag `g` wird nur der erste Treffer gefunden – genau wie bei `match` und `replace`. Angezeigt werden bis zu 1.000 Treffer.

Der Text wird im Browser verarbeitet und nirgendwohin gesendet.

## Flags

| Flag | Wirkung |
|---|---|
| `g` | findet alle Treffer, nicht nur den ersten |
| `i` | ignoriert Groß- und Kleinschreibung |
| `m` | `^` und `$` greifen am Anfang und Ende jeder Zeile, nicht nur des ganzen Textes |
| `s` | der Punkt `.` passt auch auf Zeilenumbrüche |
| `u` | Unicode-Modus: Klassen `\p{…}`, Zeichen außerhalb der BMP (Emojis) als ein Zeichen, strengere Syntax |
| `y` | „sticky“: jeder Treffer muss genau dort beginnen, wo der vorige endete |

## Spickzettel

| Muster | Bedeutung |
|---|---|
| `.` | beliebiges Zeichen außer Zeilenumbruch |
| `\d`, `\w`, `\s` | Ziffer, lateinischer Buchstabe/Ziffer/`_`, Leerraum |
| `\D`, `\W`, `\S` | alles außer dem Obigen |
| `[abc]`, `[^0-9]` | eines dieser Zeichen; alles außer Ziffern |
| `*`, `+`, `?` | 0-mal oder öfter, 1-mal oder öfter, 0- oder 1-mal |
| `{2,5}` | 2- bis 5-mal |
| `*?`, `+?` | genügsame (lazy) Varianten: so wenige Zeichen wie möglich |
| `^`, `$`, `\b` | Anfang, Ende, Wortgrenze |
| `(…)`, `(?<name>…)`, `(?:…)` | Gruppe, benannte Gruppe, nicht erfassende Gruppe |
| `a\|b` | `a` oder `b` |
| `(?=…)`, `(?!…)` | gefolgt / nicht gefolgt von … |
| `(?<=…)`, `(?<!…)` | davor steht / steht nicht … |
| `\p{L}` | jeder Buchstabe jedes Alphabets (nur mit Flag `u`) |

## Beispiele

**Zahlen im Text.** `\d+` mit Flag `g` liefert in „Bestellung 15 über 1.250 €“ drei Treffer: `15`, `1` und `250` – der Tausenderpunkt trennt die Zahl. Mit `\d[\d.]*` bleibt sie ganz.

**Doppelte Wörter.** `\b(\w+)\s+\1\b` mit den Flags `gi` findet „die die“ in „Lies die die Anleitung“: `\1` verweist auf den Text der ersten Gruppe.

**Überflüssige Leerzeichen.** Muster `\s{2,}`, Flag `g`, ein einzelnes Leerzeichen als Ersetzung: „zu   viele    Leerzeichen“ → „zu viele Leerzeichen“.

**Vertauschen mit benannten Gruppen.** Das Muster `(?<first>\p{L}+) (?<last>\p{L}+)` mit Flag `u` und die Ersetzung `$<last>, $<first>` machen aus „Jörg Müller“ „Müller, Jörg“.

## Die Ersetzungszeichenkette

- `$1`, `$2` … – Text einer Gruppe nach Nummer;
- `$<name>` – Text einer benannten Gruppe;
- `$&` – der ganze Treffer;
- `` $` `` und `$'` – Text vor und nach dem Treffer;
- `$$` – ein Dollarzeichen.

Zum Beispiel macht das Muster `(\d+)-(\d+)-(\d+)` mit der Ersetzung `$3.$2.$1` aus `2026-03-15` das Datum `15.03.2026`.

## Häufige Fragen

**Warum erkennt `\w` keine Umlaute?** In JavaScript ist `\w` nur `[A-Za-z0-9_]`, und `\b` die Grenze zwischen solchen Zeichen. `\w+` zerlegt „Müller“ deshalb in `M` und `ller`. Für Buchstaben jeder Sprache nehmen Sie `\p{L}` mit Flag `u`.

**Warum gibt es ohne Flag `g` nur einen Treffer?** So arbeitet JavaScript: `str.match(re)` und `str.replace(re, …)` ohne `g` behandeln nur den ersten Treffer. Der Tester verhält sich genauso, damit das Ergebnis zu Ihrem Code passt.

**Die Seite meldet, der Ausdruck wurde abgebrochen. Was heißt das?** Manche Ausdrücke wie `(a+)+$` brauchen bei einem fast passenden String exponentiell lange – das nennt man katastrophales Backtracking (ReDoS). Der Tester rechnet in einem eigenen Thread und bricht nach 2 Sekunden ab, damit die Seite nicht hängt. Im echten Code sollte man so einen Ausdruck ohne verschachtelte Quantoren umschreiben.

**Funktioniert das auch für Regex in Python, PHP oder Java?** Die Grundsyntax ist gleich, aber es gibt Unterschiede: JavaScript kennt keine possessiven Quantoren wie `a++` und keine atomaren Gruppen, Flags werden anders gesetzt, und Python schreibt benannte Gruppen als `(?P<name>…)`. Einfache Ausdrücke verhalten sich überall gleich.

Doppelte Zeilen entfernen oder sortieren können Sie mit dem [Zeilen-Werkzeug](/de/text/line-tools/), zwei Textfassungen vergleichen mit dem [Textvergleich](/de/dev/text-diff/).
