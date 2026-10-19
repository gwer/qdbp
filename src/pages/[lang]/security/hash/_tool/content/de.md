## Was ist ein Hash?

Ein Hash ist ein „Fingerabdruck“ von Daten mit fester Länge. Gleicher Text ergibt immer denselben Hash, und schon ein geändertes Zeichen verändert ihn vollständig. Aus einem Hash lässt sich der ursprüngliche Text nicht zurückgewinnen.

Hashes werden für Prüfsummen von Dateien, digitale Signaturen, Git und Blockchains verwendet.

## So funktioniert's

Text eingeben oder einfügen – die Hashwerte aller Algorithmen werden sofort berechnet. Der Text wird als UTF-8 kodiert, alles läuft im Browser.

## Beispiele

- `hello` → MD5 `5d41402abc4b2a76b9719d911017c592`
- `hello` → SHA-256 `2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824`

## Welchen Algorithmus nehmen?

- **SHA-256** ist der heutige Standard für Prüfsummen, Signaturen und Integritätsprüfungen.
- **SHA-384 und SHA-512** sind längere Varianten derselben Familie.
- **MD5 und SHA-1** gelten als veraltet: Es gibt praktische Kollisionsangriffe. Nur für Kompatibilität oder schnelle Prüfungen verwenden, nie für Sicherheit.

## Häufige Fragen

**Darf ich Passwörter als SHA-256 speichern?** Nein. Für Passwörter braucht man langsame, gesalzene Verfahren wie bcrypt, scrypt oder Argon2.

**Warum stimmt mein Hash nicht mit einem anderen Tool überein?** Prüfen Sie Leerzeichen und Zeilenumbrüche am Ende sowie die Kodierung – hier ist Text immer UTF-8.
