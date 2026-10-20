## So funktioniert es

Fügen Sie Ihre HEIC-Fotos hinzu – per Drag-and-drop, über die Dateiauswahl oder aus der Zwischenablage. Bei der ersten Datei lädt der Browser einmalig den HEIC-Decoder (etwa 0,5 MB), danach werden die Dateien nacheinander umgewandelt. Die JPGs laden Sie einzeln oder gesammelt als ZIP herunter.

Die Pixelmaße bleiben gleich, die Drehung des Fotos wird übernommen. Die Qualität steht standardmäßig auf 90 % – mit bloßem Auge kaum vom Original zu unterscheiden. Wenn Sie PNG (verlustfrei) oder WebP brauchen, wählen Sie es in der Liste.

Die Fotos werden direkt im Browser verarbeitet und nirgendwohin hochgeladen.

## Warum fotografiert das iPhone in HEIC?

Seit iOS 11 speichert die iPhone-Kamera Fotos standardmäßig als HEIC – das Format HEIF mit HEVC-Kompression (H.265). Bei gleicher Qualität ist die Datei deutlich kleiner als ein JPG, so passen mehr Fotos aufs Telefon. Windows ohne Zusatz-Erweiterungen, viele Websites, Mail-Dienste und ältere Programme öffnen HEIC aber nicht – deshalb die Umwandlung.

## So speichert das iPhone gleich als JPG

- **Einstellungen → Kamera → Formate → „Maximale Kompatibilität“.** Neue Fotos werden als JPG gespeichert (Videos als H.264). Bereits aufgenommene bleiben HEIC.
- **Einstellungen → Fotos → „Auf Mac oder PC übertragen“ → „Automatisch“.** Beim Kopieren per Kabel auf den Computer wandelt das iPhone die Fotos in JPG um, auf dem Telefon bleiben sie HEIC.

## Häufige Fragen

**Bleiben Aufnahmedatum und Standort erhalten?** Nein. EXIF-Metadaten – Telefonmodell, Datum, GPS-Koordinaten – werden nicht in die neue Datei übernommen. Praktisch, wenn das Foto veröffentlicht wird. Was in einem Foto steckt, zeigt der [EXIF-Viewer](/de/images/exif/).

**Liegt das Foto danach auf der Seite?** Nein. Das iPhone speichert die Drehung getrennt vom Bild; der Konverter wendet sie an, und das JPG ist gleich richtig ausgerichtet.

**Was ist mit Live Photos und Serienaufnahmen?** Umgewandelt wird das Hauptbild. Das Video eines Live Photos ist eine eigene .MOV-Datei und spielt hier keine Rolle. Enthält eine HEIC-Datei mehrere Bilder, wird das als Hauptbild markierte verwendet.

**Warum kann das JPG größer sein als die HEIC-Datei?** HEIC komprimiert effizienter, deshalb fällt das JPG bei hoher Qualität oft größer aus. Um die Datei kleiner zu machen, senken Sie die Qualität auf 80–85 % oder schicken die JPGs durch den [Bildkompressor](/de/images/compress-image/).

**Gibt es Grenzen?** Bis 50 MB pro Datei und 100 Megapixel pro Bild – 48-MP-Aufnahmen vom iPhone Pro gehen problemlos. Ist eine Datei kein HEIC, beschädigt oder reicht der Browserspeicher nicht, erscheint bei dieser Datei ein Hinweis, die übrigen werden normal umgewandelt.

**Wie öffne ich HEIC unter Windows ohne Umwandlung?** Unter Windows 10 und 11 installieren Sie aus dem Microsoft Store die „HEIF-Bilderweiterungen“ und die „HEVC-Videoerweiterungen“. Wenn Sie ein Foto nur verschicken oder hochladen wollen, geht die Umwandlung in JPG hier schneller.

Für JPG, PNG und WebP gibt es den [Bildkonverter](/de/images/convert-image/).

Der HEIC-Decoder basiert auf den freien Bibliotheken libheif und libde265 unter der Lizenz LGPL-3.0: [Lizenz und Quellcode](/licenses/libheif.txt).
