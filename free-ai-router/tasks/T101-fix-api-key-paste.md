---
github_issue: 
title: 修正 Settings/Wizard API key 輸入無法貼上的問題
type: feature
priority: high
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T101 - 修正 Settings/Wizard API key 貼上無效

## 目標
Settings 與首次啟動精靈輸入 API key 時，Cmd+V 貼上完全無效。
bubbletea v1 預設啟用 bracketed paste，貼上內容會以單一
`KeyMsg{Runes: [...], Paste: true}`（多字元）送達，但輸入處要求
`len(msg.Runes) == 1`，整段貼上被丟棄。

## 驗收標準
- [x] settings.go 的 key 編輯 default case 改為迭代所有 msg.Runes
- [x] wizard.go handleKeyEntryInput 改接收 tea.KeyMsg（貼上的 String() 會包 `[...]`，必須讀 Runes）
- [x] 新增 TestSettingsPasteKey / TestSettingsMultiRuneKeyMsg / TestWizardPasteKey 全數通過

## 備註
commit 無獨立記錄（併入後續 0731a23 之前的本地修正）。
關鍵細節：貼上訊息的 `msg.String()` 會被 bubbletea 包成 `"[內容]"`，
解析時務必使用 `msg.Runes`。
