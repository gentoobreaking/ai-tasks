# md-viewer-application

**md-viewer** est un lecteur Markdown hautes performances spécialement conçu pour macOS.

## Composition du projet

| Projets | Pile technologique | Statut |
|------|---------|------|
| `md-viewer-webview/` | Aller + webview_go + Swift-markdown (CGO) | ✅ **Ligne principale** |
| `md-viewer-fyne/` | Aller + Fyne | Préservation du contraste |

La **solution webview** a finalement été sélectionnée, voir [T008 Évaluation comparative](tasks/T008-專案分裂與對比評估.md).

## Fonction implémentée

| Fonction | Tâche |
|------|-------|
| Moteur d'analyse Swift-markdown | T003 |
| Changement instantané de 6 thèmes | T005, T014 |
| coloration syntaxique highlight.js + bouton copier | T017 |
| Panneau de configuration (zoom/police/langue/numéro de ligne) | T011-C~G, T011-FIX |
| Menu natif NSMenu | T011-A, T011-B |
| i18n (chinois traditionnel/chinois simplifié/anglais/japonais/coréen) | T011-FIX-02, T011-FIX-03 |
| Faites glisser pour ouvrir le fichier .md | T010 |
| Surveillance des fichiers, rechargement automatique (y compris rechargement flash) | T013 |
| Association de fichiers macOS (double-cliquez sur .md pour ouvrir) | T011-L |
| Fonction de traduction (⌘⇧T, 3 backends) | T028 |
| Exportation HTML/PDF | T019 |
| Plein écran (⌘F) | T011-FIX-04 |
| Persistance du zoom (conservée lors du rechargement/redémarrage) | T011-FIX-01, T011-FIX-05 |

## Sauter les éléments

| Tâche | Descriptif |
|------|------|
| T004 | Liste des fichiers de la barre latérale (positionnement du produit en tant que lecteur pur) |
| T015 | Plug-in Quick Look (nécessite Swift + Xcode .qlgenerator) |
| T018 | Mode petite fenêtre supérieure (webview_go n'expose pas setWindowLevel) |
| T020 | Formules mathématiques (non intégrées à MathJax/KaTeX) |
| T021 | Graphique des sirènes (non intégré à mermaid.js) |

## Nouvelles fonctionnalités à implémenter

| Tâche | Nom | Descriptif |
|------|------|------|
| T022 | Rechercher le contenu du fichier | ⌘F Recherche + Navigation Précédent/Suivant |
| T023 | Rétention de la position de défilement | Conserver la position de défilement actuelle après le rechargement |
| T024 | Mémoire de taille/position de fenêtre | Restaurer automatiquement la fenêtre après la fermeture et la réouverture du cadre |
| T025 | Fichiers récemment ouverts | NSMenu → Sous-menu Fichier avec un maximum de 10 entrées |
| T026 | Mode de mise au point | ⌘\ Fondu les paragraphes non ciblés |
| T027 | Aperçu du lien en survol | Survol de la souris lien .md local Aperçu de l'affichage 500 ms |

## Liste des tâches

| # | Nom | Statut |
|---|------|------|
| T001 | Évaluation de l'environnement Fyne | ✅ terminé |
| T002 | Créer un squelette et une fenêtre Go | ✅ terminé |
| T003 | Analyse Markdown et rendu WebView | ✅ terminé |
| T004 | Liste des fichiers de la barre latérale | ⚠️ sauter |
| T005 | Prise en charge du mode sombre | ✅ terminé |
| T006 | Créer et tester l'application macOS | ✅ terminé |
| T007 | Touches de raccourci des tests automatisés | ✅ terminé |
| T008 | Fractionnement du projet et évaluation comparative | ✅ terminé |
| T009 | Paramètres des icônes | ✅ terminé |
| T010 | Prise en charge du glisser-déposer pour ouvrir les fichiers md | ✅ terminé |
| T010-B1 | Recherche webview_go NSWindow | ✅ terminé |
| T011-A~G | NSMenu / Série de panneaux de configuration | ✅ terminé |
| T011-FIX-01~05 | Réparation Zoom/i18n/barre de menus | ✅ terminé |
| T011-L | Association de fichiers macOS | ✅ terminé |
| T011-Barre de menu | Réglage de la sensibilité du pavé tactile | ✅ terminé |
| T012 | Moteur de rendu extrêmement rapide | ✅ terminé |
| T013 | Surveillance des modifications de fichiers | ✅ terminé |
| T014 | Changement de thème multiple | ✅ terminé |
| T015 | Plugin Aperçu rapide | ⚠️ sauter |
| T016 | Table des matières automatique | 📋 en attente |
| T028 | Fonction de traduction (MyMemory/DeepL/LibreTranslate) | ✅ terminé |
| T017 | Code de coloration syntaxique | ✅ terminé |
| T018 | Mode petite fenêtre supérieure | ⚠️ sauter |
| T019 | Exportation PDF/HTML | ✅ terminé |
| T020 | Formule mathématique | ⚠️ sauter |
| T021 | Graphique des sirènes | ⚠️ sauter |
| T022 | Rechercher le contenu du fichier | 📋 en attente |
| T023 | Rétention de la position de défilement | 📋 en attente |
| T024 | Mémoire de taille/position de fenêtre | ✅ terminé |
| T025 | Fichiers récemment ouverts | ✅ terminé |
| T026 | Mode de mise au point | 🔧 en cours |
| T027 | Aperçu du lien en survol | 📋 en attente |

**✅ terminé : 18 | ⚠️ sauter : 5 | 📋 en attente : 7**
