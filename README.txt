NOVA Web-App MVP 0.3

GRUNDLAGE
Diese Version baut auf NOVA 0.1 auf. Das visuelle Erscheinungsbild und die drei Hauptbereiche Nachrichten, Kalender und Einstellungen bleiben erhalten.

ENTHALTEN
- Nachrichtenanalyse mit lokalen Schlüsselwortregeln
- Antwortvorschlag im bisherigen Hybrid-Stil
- Antwort in die Zwischenablage kopieren
- Lokaler Kalender mit Termin-Erstellung und Löschfunktion
- Apple-Kalender-Import aus .ics-Dateien
- Export der NOVA-Termine als .ics-Datei für Apple Kalender
- Duplikaterkennung beim Import
- PWA-Grundgerüst mit verbessertem Offline-Cache
- Dunkles, responsives Design

VERBESSERUNGEN IN 0.2 (übernommen)
- Datumsinitialisierung verwendet die lokale Zeitzone (verhindert Datumsverschiebungen um Mitternacht).
- Kalenderdaten werden beim Lesen validiert; fehlerhafte Einträge werden ignoriert.
- Fehler beim lokalen Speichern/Löschen werden abgefangen.
- Termine in der Vergangenheit können nicht neu angelegt werden.
- Nachrichtenanalyse-Ergebnis wird ausgeblendet, sobald der Nachrichtentext verändert wird.
- Service Worker unterscheidet Navigation und statische Dateien, liefert offline gezielt die App-Seite aus und verwendet einen neuen Cache-Namen.

APPLE-KALENDER-ANBINDUNG 0.3
- Der Import liest VEVENT-Einträge aus .ics-Dateien (Titel, Startdatum und Startzeit).
- Der Export erstellt eine .ics-Datei, die in Apple Kalender geöffnet/importiert werden kann.
- Es handelt sich um Dateiübertragung, nicht um automatische bidirektionale Live-Synchronisierung.
- Für eine echte direkte iCloud-Synchronisierung ist eine native iOS-App mit Apples EventKit oder ein sicherer Server mit iCloud-CalDAV-Anbindung erforderlich. Eine Web-PWA kann nicht direkt auf die lokale Apple-Kalenderdatenbank des iPhones zugreifen.
- NOVA fragt keine Apple-ID oder kein App-spezifisches Passwort ab.

WICHTIGE GRENZEN
- Dies ist weiterhin ein Prototyp, kein fertiges KI-System.
- Nachrichten werden nicht automatisch aus WhatsApp ausgelesen oder versendet.
- Die Analyse nutzt lokale Schlüsselwortregeln, kein Sprachmodell.
- Termine werden nur in NOVA gespeichert und nicht mit Apple Kalender synchronisiert.
- Es gibt noch keine geräteübergreifende Synchronisierung oder Benutzerkonten.
- Die App muss auf HTTPS oder localhost laufen, damit PWA-Funktionen verfügbar sind.

AUF DEM IPHONE NUTZEN
1. Die Dateien auf einer HTTPS-Webadresse veröffentlichen.
2. Die Adresse in Safari öffnen.
3. Teilen > Zum Home-Bildschirm auswählen.
4. Falls angeboten, "Als Web-App öffnen" aktivieren und hinzufügen.

NÄCHSTE SINNVOLLE ENTWICKLUNGSSCHRITTE
1. KI-gestützte Nachrichtenanalyse über einen sicheren Server-Endpunkt.
2. Termine bearbeiten sowie Kalenderimport/-export.
3. Einstellungen für Tonalität und Antwortlänge.
4. Optionaler Kalender- und Wetterzugriff mit ausdrücklicher Freigabe.

SICHERHEIT
Geheime API-Schlüssel dürfen niemals im Browser-Code hinterlegt werden. Eine spätere KI-Anbindung benötigt einen geschützten Server-Endpunkt.
