# free-ai-router：剩餘差距任務拆分（2026-08-04）

## 產出
從程式碼審查結果中，根據 SPECIFICATION.md v1.0 對比「目前實作進度 vs 需求」，產生了 4 個新任務：

| 任務 | 檔案 | 優先級 | 類型 | 說明 |
|------|------|--------|------|------|
| T065 | `T065-tui-dead-file-cleanup.md` | low | cleanup | 刪除 Bubble Tea 重構後遺留的 dead files（colors.go/input.go/primitives.go，共 405 行） |
| T066 | `T066-pollinations-text-router-hook.md` | high | feature | 將已實作的 Pollinations /text adapter 接入 router forward() 路徑（T063 的完成部分） |
| T067 | `T067-tui-first-run-wizard.md` | medium | feature | 在 TUI 內部實作完整的首次執行引導精靈（T016 的補完部分） |
| T068 | `T068-settings-screen-interactions.md` | medium | feature | 補完設定畫面互動功能（toggle/edit key/test ping/delete/open browser） |

## 任務定位
所有任務：
- **路徑**：`~/tasks/free-ai-router/tasks/`
- **範本**：`~/Projects/ai-skills/clw-ideas2tasks/templates/task-template.md`
- **assignee**：OpenCode with DeepSeek V4 Flash
- **status**：pending

## 任務相依性
```
T065 (cleanup, 獨立)
T066 (router hook, 獨立)
T067 (TUI wizard) → T068 完成後更有基礎（共用 settings 狀態模型）
T068 (settings interactions) → 獨立
```

## T066 關鍵細節
- Pollinations /text 是**唯一真正零 API key 的免費選項**— 這是關鍵差異化功能
- Adapter 層 (`internal/providers/pollinations.go`) 100% 已就緒
- 只需在 `internal/router/routing.go:forward()` 新增 `forwardPollinationsText()` 分支
- Streaming 處理：/text 端點不支援 SSE → 回傳單一 chunk 或無視 streaming flag

## T068 關鍵細節
- `RenderSettings()` 渲染已完整（含操作提示文字）
- `handleSettingsInput()` 目前只處理 ESC/Q/Ctrl+C
- 需新增狀態欄位：`settingsIndex`、`settingsKeyEdit`、`settingsKeyBuf`、`settingsEditFor`
- Provider signup URLs + key prefix validation 已整理在任務檔中
