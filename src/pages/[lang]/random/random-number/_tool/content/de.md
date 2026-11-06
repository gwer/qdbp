## So funktioniert der Generator

Legen Sie den Bereich „von“ und „bis“ fest (beide Zahlen sind eingeschlossen), wie viele Zahlen Sie brauchen und ob sich Zahlen wiederholen dürfen. Klicken Sie auf „Erzeugen“ – jedes Mal entsteht eine neue Auswahl.

## Fairer Zufall

Die Zahlen werden in Ihrem Browser mit einem kryptografischen Zufallsgenerator (`crypto.getRandomValues`) erzeugt. Jede Zahl im Bereich hat genau dieselbe Chance: Der Rechner verwirft die wenigen Rohwerte, die sonst kleinere Zahlen minimal bevorzugen würden.

## Beispiele

- Würfeln: von 1 bis 6, eine Zahl.
- Gewinner einer Verlosung unter 250 Teilnehmern: von 1 bis 250, eine Zahl.
- Drei Gewinner ohne Wiederholung: von 1 bis 250, drei Zahlen, „Ohne Wiederholung“.
- Lotto 6 aus 49: von 1 bis 49, sechs Zahlen ohne Wiederholung, aufsteigend sortiert.

## Häufige Fragen

**Lässt sich das Ergebnis vorhersagen oder beeinflussen?** Nein. Der Generator nutzt weder die Uhrzeit noch andere vorhersehbare Daten, und die Ergebnisse werden nirgends gespeichert.

**Wie viele Zahlen kann ich auf einmal erzeugen?** Bis zu 1.000. Ohne Wiederholung höchstens so viele, wie der Bereich enthält.

**Gehen auch negative Zahlen?** Ja, zum Beispiel von −10 bis 10.
