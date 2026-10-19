## Warum URLs kodieren?

In einer URL sind nur lateinische Buchstaben, Ziffern und wenige Sonderzeichen erlaubt. Leerzeichen, Umlaute und `&`, `=`, `?`, `#` innerhalb eines Parameters müssen als `%XX` geschrieben werden – das ist die Prozentkodierung. Der Browser erledigt das automatisch, aber wenn Sie Links von Hand, im Code oder in UTM-Parametern zusammenbauen, müssen Sie Werte selbst kodieren.

## So funktioniert's

Wählen Sie „Kodieren“, um Text URL-sicher zu machen, oder „Dekodieren“, um einen Link voller `%XX` wieder lesbar zu machen.

## Beispiele

- `Größe & Preis` → `Gr%C3%B6%C3%9Fe%20%26%20Preis`
- `price%20%26%20size` → `price & size`

## Häufige Fragen

**Warum ist ein Leerzeichen mal `%20` und mal `+`?** In Formular-Abfragezeichenfolgen wird ein Leerzeichen traditionell als `+` geschrieben, sonst in der URL als `%20`. Beim Dekodieren gilt `+` als Leerzeichen; beim Kodieren wird immer `%20` verwendet – das funktioniert überall.

**Wird `/` kodiert?** Ja: Das Tool kodiert wie einen Parameterwert (`encodeURIComponent`), daher werden auch `/`, `?`, `&` und `=` zu `%XX`. Kodieren Sie einzelne Werte, nicht die ganze URL.

Für beliebige Daten gibt es [Base64](/de/security/base64/).
