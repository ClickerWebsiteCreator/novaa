# Nova für iPhone

Nova als Web-App (PWA) für das iPhone – kostenlos, ohne App Store, ohne Mac.

**Funktionen**
- **Bibliothek:** Fotos, Videos, Musik, PDFs und Dokumente speichern · Ordner und Unterordner in beliebiger Tiefe ·
  Pfadleiste (Bibliothek › Bilder › Urlaub) · Verschieben, Umbenennen, Löschen · Favoriten · Mehrfachauswahl ·
  Suche über alle Unterordner · Filter nach Typ · Sortieren · Vorschaubilder für Fotos und Videos
- **Player:** Videos und Musik mit Vorspulen, merkt sich die letzte Position · Fotos wischen
- **Teilen:** Dateien zurück in die Fotos- oder Dateien-App sichern oder an andere Apps senden
- **Suchleiste:** Google, DuckDuckGo, Bing oder Ecosia · Vorschläge aus Suchverlauf, Schnellzugriffen und Bibliothek ·
  Adressen direkt öffnen · Schnellzugriffe bearbeitbar
- **Design:** Dunkel/Hell/wie iPhone, Akzentfarbe wählbar · funktioniert offline

**Datenschutz:** Alle Dateien bleiben **auf deinem iPhone** (im Speicher von Safari). Nichts wird hochgeladen – auch nicht zu GitHub.
GitHub stellt nur die App selbst bereit.

---

## Einrichten mit GitHub Pages (einmalig, ca. 5 Minuten)

### 1. Repository anlegen
1. Auf [github.com](https://github.com) anmelden.
2. Oben rechts auf **+** → **New repository**.
3. **Repository name:** `nova` (oder ein anderer Name – er wird Teil der Adresse).
4. **Public** auswählen (GitHub Pages ist für öffentliche Repositorys kostenlos).
5. Auf **Create repository** klicken.

### 2. Dateien hochladen
1. Im neuen Repository auf **uploading an existing file** klicken
   (oder **Add file** → **Upload files**).
2. **Den Inhalt** dieses Ordners „Iphone Github“ in das Browserfenster ziehen:
   `index.html`, `manifest.webmanifest`, `sw.js`, `README.md` und die Ordner `css`, `js`, `icons`.
   Wichtig: den *Inhalt* ziehen, nicht den Ordner „Iphone Github“ selbst – `index.html` muss ganz oben liegen.
3. Unten auf **Commit changes** klicken.

### 3. GitHub Pages einschalten
1. Im Repository auf **Settings** → links **Pages**.
2. Bei **Source**: **Deploy from a branch**.
3. Bei **Branch**: `main` und `/ (root)` auswählen → **Save**.
4. Nach 1–2 Minuten erscheint oben: *Your site is live at* `https://DEINNAME.github.io/nova/`

### 4. Auf dem iPhone installieren
1. Die Adresse in **Safari** öffnen (nicht in Chrome – nur Safari kann Apps zum Home-Bildschirm hinzufügen).
2. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
3. **Zum Home-Bildschirm** → **Hinzufügen**.
4. Nova vom Home-Bildschirm starten – es öffnet sich im Vollbild wie eine App.

> Tipp: Nur die vom Home-Bildschirm gestartete App speichert dauerhaft. In einem normalen Safari-Tab kann iOS die Daten nach
> einigen Wochen ohne Nutzung löschen.

---

## Bedienung

| Was | Wie |
|---|---|
| Dateien hinzufügen | Bibliothek → **Hinzufügen** → Fotomediathek, Kamera oder Dateien wählen |
| Ordner anlegen | Bibliothek → **Ordner** (wird im aktuell geöffneten Ordner angelegt) |
| Ordner/Datei-Optionen | Lange auf Ordner oder Datei drücken |
| Mehrere verschieben/löschen | **⋯** → **Auswählen** oder lange drücken → **Mehrere auswählen** |
| Zurück zu einem übergeordneten Ordner | Oben in der Pfadleiste auf den Ordnernamen tippen |
| Datei ins iPhone zurücksichern | Datei öffnen → Teilen-Symbol → „Bild sichern“ / „In Dateien sichern“ |
| Webseite suchen/öffnen | Tab **Suche** → eintippen → Enter (öffnet in Safari) |

---

## Aktualisieren

1. Geänderte Dateien in GitHub erneut hochladen (**Add file** → **Upload files**, gleiche Namen überschreiben).
2. In `sw.js` die Zeile `const VERSION = 'nova-v1';` hochzählen (z. B. `nova-v2`), damit das iPhone die neuen Dateien lädt.
3. Nova auf dem iPhone zweimal neu öffnen. Deine gespeicherten Dateien bleiben dabei erhalten.

## Grenzen
- Webseiten öffnen sich in **Safari**, nicht innerhalb von Nova (Apple erlaubt kostenlose eigene Browser-Apps nicht).
- Wie viel gespeichert werden kann, legt iOS fest (meist ein großer Teil des freien Speichers). Die Anzeige steht unter **Einstellungen › Speicher**.
- Die Daten liegen nur auf diesem Gerät. Wird Nova vom Home-Bildschirm gelöscht, werden auch die Dateien darin gelöscht – vorher wichtige Dateien über „Teilen“ sichern.

## Dateien
```
index.html             Startseite der App
manifest.webmanifest   App-Name, Symbol, Vollbild
sw.js                  Offline-Funktion (Service Worker)
css/app.css            Design
js/db.js               Speicher auf dem Gerät (IndexedDB)
js/app.js              Suche, Bibliothek, Player, Einstellungen
icons/                 App-Symbole
```
