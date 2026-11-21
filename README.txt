NOVA Web-App MVP 0.1

ENTHALTEN
- Nachrichtenanalyse mit lokalen, einfachen Regeln
- Antwortvorschlag im Hybrid-Stil
- Lokaler Kalenderbereich (Termine im Browser speichern)
- PWA-Grundgerüst mit Offline-Cache
- Dunkles, responsives Design

WICHTIGE GRENZEN
- Dies ist ein erster Prototyp, kein fertiges KI-System.
- Nachrichten werden nicht automatisch aus WhatsApp ausgelesen oder versendet.
- Die Analyse nutzt lokale Schlüsselwortregeln, kein Sprachmodell.
- Termine werden nur in NOVA gespeichert und nicht mit Apple Kalender synchronisiert.
- Die App wurde als Web-Prototyp erstellt, aber nicht auf jedem Gerät/Browsersystem getestet.

AUF DEM IPHONE NUTZEN
1. Die Dateien müssen auf einer HTTPS-Webadresse veröffentlicht werden.
2. Öffne diese Adresse in Safari.
3. Tippe auf Teilen > Zum Home-Bildschirm.
4. Aktiviere falls angeboten "Als Web-App öffnen" und tippe auf Hinzufügen.

LOKAL TESTEN
Für PWA-Funktionen wie Service Worker muss die App über localhost oder HTTPS laufen.
Die index.html direkt als Datei zu öffnen reicht für den Offline-App-Modus nicht aus.

Nächster sinnvoller Ausbauschritt:
- echte KI-Analyse über einen sicheren Server-Endpunkt (nicht mit geheimen API-Schlüsseln im Browser)
- Kalenderimport/-export
- optionale Standort- und Wetterfunktionen mit ausdrücklicher Freigabe
