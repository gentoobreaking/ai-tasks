# md-viewer-app

**md-viewer** is a high-performance Markdown reader specially built for macOS.

## Project composition

| Projects | Technology Stack | Status |
|------|---------|------|
| `md-viewer-webview/` | Go + webview_go + Swift-markdown (CGO) | ✅ **Mainline** |
| `md-viewer-fyne/` | Go + Fyne | Contrast Preservation |

The **webview solution** was finally selected, see [T008 Comparative Evaluation](tasks/T008-專案分裂與對比評估.md).

## Function implemented

| Function | Task |
|------|-------|
| Swift-markdown parsing engine | T003 |
| 6 theme instant switching | T005, T014 |
| highlight.js syntax highlighting + copy button | T017 |
| Setting panel (zoom/font/language/line number) | T011-C~G, T011-FIX |
| NSMenu native menu | T011-A, T011-B |
| i18n (Traditional Chinese/Simplified Chinese/English/Japanese/Korean) | T011-FIX-02, T011-FIX-03 |
| Drag to open .md file | T010 |
| File monitoring automatic reload (including reload flash) | T013 |
| macOS file association (double-click .md to open) | T011-L |
| Translation function (⌘⇧T, 3 backends) | T028 |
| HTML / PDF Export | T019 |
| Full screen (⌘F) | T011-FIX-04 |
| Zoom persistence (retained across reload/restart) | T011-FIX-01, T011-FIX-05 |

## Skip items

| Task | Description |
|------|------|
| T004 | Sidebar file list (product positioning as pure reader) |
| T015 | Quick Look plug-in (requires Swift + Xcode .qlgenerator) |
| T018 | Top small window mode (webview_go does not expose setWindowLevel) |
| T020 | Mathematical formulas (not integrated with MathJax/KaTeX) |
| T021 | Mermaid chart (not integrated with mermaid.js) |

## New features to be implemented

| Task | Name | Description |
|------|------|------|
| T022 | Search file content | ⌘F Search + Previous/Next Navigation |
| T023 | Scroll position retention | Maintain the current scroll position after reload |
| T024 | Window size/position memory | Automatically restore window after closing and reopening frame |
| T025 | Recently opened files | NSMenu → File submenu with a maximum of 10 entries |
| T026 | Focus Mode | ⌘\ Fade non-focused paragraphs |
| T027 | Link hover preview | Mouse hover local .md link 500ms display preview |

## Task list

| # | Name | Status |
|---|------|------|
| T001 | Assessing the Fyne environment | ✅ done |
| T002 | Create Go skeleton and Window | ✅ done |
| T003 | Markdown parsing and WebView rendering | ✅ done |
| T004 | Sidebar file list | ⚠️ skip |
| T005 | Dark mode support | ✅ done |
| T006 | Build and test macOS App | ✅ done |
| T007 | Automated testing shortcut keys | ✅ done |
| T008 | Project splitting and comparative evaluation | ✅ done |
| T009 | Icon Settings | ✅ done |
| T010 | Support drag and drop to open md files | ✅ done |
| T010-B1 | Research webview_go NSWindow | ✅ done |
| T011-A~G | NSMenu / Setting Panel Series | ✅ done |
| T011-FIX-01~05 | Zoom/i18n/menubar repair | ✅ done |
| T011-L | macOS File Association | ✅ done |
| T011-Menubar | Touchpad sensitivity setting | ✅ done |
| T012 | Extremely fast rendering engine | ✅ done |
| T013 | File change monitoring | ✅ done |
| T014 | Multiple theme switching | ✅ done |
| T015 | Quick Look plugin | ⚠️ skip |
| T016 | Automatic Outline TOC | 📋 pending |
| T028 | Translation function (MyMemory/DeepL/LibreTranslate) | ✅ done |
| T017 | Syntax Highlighting Code | ✅ done |
| T018 | Top small window mode | ⚠️ skip |
| T019 | PDF/HTML export | ✅ done |
| T020 | Math formula | ⚠️ skip |
| T021 | Mermaid chart | ⚠️ skip |
| T022 | Search file content | 📋 pending |
| T023 | Scroll position retention | 📋 pending |
| T024 | Window size/position memory | ✅ done |
| T025 | Recently opened files | ✅ done |
| T026 | Focus mode | 🔧 in-progress |
| T027 | Link hover preview | 📋 pending |

**✅ done: 18 | ⚠️ skip: 5 | 📋 pending: 7**
