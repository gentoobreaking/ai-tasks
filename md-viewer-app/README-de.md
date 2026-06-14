# md-viewer-app

**md-viewer** ist ein leistungsstarker Markdown-Reader, der speziell für macOS entwickelt wurde.

## Projektzusammensetzung

| Projekte | Technologie-Stack | Status |
|------|---------|------|
| `md-viewer-webview/` | Go + webview_go + Swift-Markdown (CGO) | ✅ **Hauptlinie** |
| `md-viewer-fyne/` | Geh + Fyne | Kontrasterhaltung |

Die **Webview-Lösung** wurde schließlich ausgewählt, siehe [T008 Vergleichende Bewertung](tasks/T008-專案分裂與對比評估.md).

## Funktion implementiert

| Funktion | Aufgabe |
|------|-------|
| Swift-Markdown-Parsing-Engine | T003 |
| 6 Themen-Sofortwechsel | T005, T014 |
| Highlight.js-Syntaxhervorhebung + Schaltfläche „Kopieren“ | T017 |
| Einstellungsfeld (Zoom/Schriftart/Sprache/Zeilennummer) | T011-C~G, T011-FIX |
| NSMenu natives Menü | T011-A, T011-B |
| i18n (Traditionelles Chinesisch/Vereinfachtes Chinesisch/Englisch/Japanisch/Koreanisch) | T011-FIX-02, T011-FIX-03 |
| Zum Öffnen der .md-Datei ziehen | T010 |
| Automatisches Neuladen der Datei (einschließlich Flash-Neuladen) | T013 |
| macOS-Dateizuordnung (zum Öffnen doppelklicken Sie auf .md) | T011-L |
| Übersetzungsfunktion (⌘⇧T, 3 Backends) | T028 |
| HTML-/PDF-Export | T019 |
| Vollbild (⌘F) | T011-FIX-04 |
| Zoom-Persistenz (über Neuladen/Neustart hinweg beibehalten) | T011-FIX-01, T011-FIX-05 |

## Elemente überspringen

| Aufgabe | Beschreibung |
|------|------|
| T004 | Sidebar-Dateiliste (Produktpositionierung als reiner Reader) |
| T015 | Quick Look-Plugin (erfordert Swift + Xcode .qlgenerator) |
| T018 | Oberer kleiner Fenstermodus (webview_go macht setWindowLevel nicht verfügbar) |
| T020 | Mathematische Formeln (nicht in MathJax/KaTeX integriert) |
| T021 | Meerjungfrau-Diagramm (nicht in mermaid.js integriert) |

## Neue Funktionen müssen implementiert werden

| Aufgabe | Name | Beschreibung |
|------|------|------|
| T022 | Dateiinhalt durchsuchen | ⌘F Suche + vorherige/nächste Navigation |
| T023 | Beibehaltung der Bildlaufposition | Behalten Sie die aktuelle Bildlaufposition nach dem Neuladen bei |
| T024 | Fenstergrößen-/Positionsspeicher | Fenster nach dem Schließen und erneuten Öffnen des Rahmens automatisch wiederherstellen |
| T025 | Zuletzt geöffnete Dateien | NSMenu → Datei-Untermenü mit maximal 10 Einträgen |
| T026 | Fokusmodus | ⌘\ Nicht fokussierte Absätze ausblenden |
| T027 | Link-Hover-Vorschau | Mauszeiger über lokalen .md-Link 500 ms Anzeigevorschau |

## Aufgabenliste

| # | Name | Status |
|---|------|------|
| T001 | Bewertung der Fyne-Umgebung | ✅ fertig |
| T002 | Erstellen Sie ein Go-Skelett und ein Fenster | ✅ fertig |
| T003 | Markdown-Analyse und WebView-Rendering | ✅ fertig |
| T004 | Dateiliste der Seitenleiste | ⚠️ überspringen |
| T005 | Unterstützung für den Dunkelmodus | ✅ fertig |
| T006 | Erstellen und testen Sie die macOS-App | ✅ fertig |
| T007 | Tastenkombinationen für automatisierte Tests | ✅ fertig |
| T008 | Projektaufteilung und vergleichende Bewertung | ✅ fertig |
| T009 | Symboleinstellungen | ✅ fertig |
| T010 | Unterstützt Drag & Drop zum Öffnen von MD-Dateien | ✅ fertig |
| T010-B1 | Recherchieren Sie webview_go NSWindow | ✅ fertig |
| T011-A~G | NSMenu / Setting Panel Series | ✅ fertig |
| T011-FIX-01~05 | Zoom/i18n/Menüleiste reparieren | ✅ fertig |
| T011-L | macOS-Dateizuordnung | ✅ fertig |
| T011-Menüleiste | Einstellung der Touchpad-Empfindlichkeit | ✅ fertig |
| T012 | Extrem schnelle Rendering-Engine | ✅ fertig |
| T013 | Überwachung von Dateiänderungen | ✅ fertig |
| T014 | Wechsel mehrerer Themen | ✅ fertig |
| T015 | Quick Look-Plugin | ⚠️ überspringen |
| T016 | Automatisches Gliederungsinhaltsverzeichnis | 📋 ausstehend |
| T028 | Übersetzungsfunktion (MyMemory/DeepL/LibreTranslate) | ✅ fertig |
| T017 | Syntaxhervorhebungscode | ✅ fertig |
| T018 | Oben kleiner Fenstermodus | ⚠️ überspringen |
| T019 | PDF/HTML-Export | ✅ fertig |
| T020 | Mathematische Formel | ⚠️ überspringen |
| T021 | Meerjungfrau-Diagramm | ⚠️ überspringen |
| T022 | Dateiinhalt durchsuchen | 📋 ausstehend |
| T023 | Beibehaltung der Bildlaufposition | 📋 ausstehend |
| T024 | Fenstergrößen-/Positionsspeicher | ✅ fertig |
| T025 | Zuletzt geöffnete Dateien | ✅ fertig |
| T026 | Fokusmodus | 🔧 in Bearbeitung |
| T027 | Link-Hover-Vorschau | 📋 ausstehend |

**✅ erledigt: 18 | ⚠️ überspringen: 5 | 📋 ausstehend: 7**
