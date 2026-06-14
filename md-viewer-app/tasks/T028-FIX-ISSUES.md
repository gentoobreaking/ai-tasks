---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/151

title: T028-FIX-ISSUES
status: done
assignee: gemini-3-flash-preview and Cursor
created: 2026-05-09
updated: 2026-05-10
---

## 概述

修復翻譯、快捷鍵、About 版本、Debug UI、文件關聯與建置版本號等相關問題；並補上 DebugMode 設定、HTML→Markdown、預設翻譯後端與語言選項等能力。

---

## issue.1 快捷鍵 ⌘O 失效了，原本可以開檔 **(Done)**

**問題描述**  
快捷鍵 ⌘O 失效了，原本可以開檔。

**預期行為**  
按下 ⌘O 可以開啟檔案選擇對話框。

**修復方向**  
檢查 menu bar 中 Open 檔案的功能是否正常綁定快捷鍵。

---

## issue.2 翻譯時標題列沒有任何變化 **(Done)**

**問題描述**  
翻譯時標題列沒有任何變化。

**預期行為**  
翻譯時標題列應顯示翻譯狀態或進度。

**修復方向**  
在翻譯過程中更新視窗標題列。

---

## issue.3 當使用預設翻譯 API 時，還是會顯示「自動偵測」 **(Done)**

**問題描述**  
當使用預設翻譯 API 時，還是會顯示「自動偵測」（與實際後端或 UI 預期不一致）。

**預期行為**  
使用預設翻譯 API 時，介面與行為與預設後端一致；來源語言預設為自動偵測（見下方 **add：預設 Google 與自動偵測**）。

**修復方向**  
檢查翻譯 API 的設定邏輯與翻譯面板預設選項。

---

## issue.4 優化部分未顯示（Loading / Error / 翻譯完成 status） **(Done)**

**問題描述**  
優化部分未顯示（Loading / Error / 翻譯完成 status）。

**預期行為**  
翻譯時應顯示 Loading、完成後顯示翻譯完成、失敗時顯示 Error。

**修復方向**  
實作翻譯狀態的 UI 顯示（含標題列與覆蓋層等）。

---

## issue.5 從 menu bar 查看關於，目前沒有顯示版本號碼 **(Done)**

**問題描述**  
從 menu bar 查看關於，目前沒有顯示版本號碼。

**預期行為**  
關於視窗應顯示行銷版本與建置號；裸執行二進位時有合理後備提示。

**修復方向**  
以自訂 About 視窗搭配 bundle `Info.plist`（`CFBundleShortVersionString` / `CFBundleVersion`）；`build.sh` 安裝 plist。

### add.5.1 在 build.sh 宣告行銷版本並自動遞增 CFBundleVersion **(Done)**

- **CFBundleShortVersionString**：於 `build.sh` 以 `MARKETING_VERSION` 宣告（可 `MARKETING_VERSION=x.y.z ./build.sh` 覆寫）。
- **CFBundleVersion**：每次 **`./build.sh` 在 Swift / Go 編譯成功後** 將專案根目錄 **`.build_number`** 加一並寫入 plist。
- 詳見 repo 內 `AGENTS.md` / `README.md`（版本號一節）。

---

## issue.6 Debug 視覺化指標 **(Done)**

**問題描述**  
先前曾有除錯用 UI 干擾一般使用（例如翻譯相關區塊的除錯標籤等）。

**預期行為**  
僅在**偵錯模式**開啟時顯示固定角標；一般使用者不應看到除錯視覺元素。

**修復方向**  
設定內 **DebugMode** 與左下角角標連動；關閉偵錯時不顯示角標。

---

## issue.7 翻譯中區塊置中與另存進度一致 **(Done)**

**問題描述**  
翻譯時「翻譯中」全螢幕區塊偏左上角，與另存翻譯檔案時的進度畫面不一致。

**預期行為**  
翻譯中 overlay 與另存時相同：置中、相同風格（深色半透明、⏳、主副文案）；並避免 `body` 的 CSS `zoom` 導致 `fixed` 區塊錯位（掛在 `document.documentElement`）。

**修復方向**  
調整 `doTranslate` 與另存流程的 overlay DOM／樣式。

---

## issue.8 翻譯語言選項：兩個「中文」與簡繁分流 **(Done)**

**問題描述**  
翻譯面板有兩個「中文」，繁體正確，但另一個應為簡體；先前標為「中文」且不會翻成簡體。

**預期行為**  
來源／目標語言分別為 **繁體中文（zh-TW）** 與 **簡體中文（zh-CN）**；後端 `GoogleTranslate` / `MyMemory` / `DeepL` / `LibreTranslate` 對中文代碼做一致正規化。

**修復方向**  
更新翻譯面板選項與 `translator.go` 內 `normalizeChineseCode` 等對應邏輯。

---

## issue.9 修正 Info.plist 的文件類型宣告 **(Done)**

**問題描述**  
檔案關聯雙擊 `.md` 時，系統可能出現「無法開啟 Markdown document 格式」等提示，但檔案仍被開啟；或與 Launch Services 驗證不一致。

**預期行為**  
`CFBundleDocumentTypes` / UTI 與 **提前註冊 NSApp delegate**、**儘早 `RegisterOpenFileCallback`**、`FlushPendingOpenFile`、實作 `openURLs:` / `openFiles:` 等一併配合，避免開檔事件早於 delegate 或 callback。

**修復方向**  
拆分 Markdown 與純文字宣告、`LSHandlerRank`、`NSPrincipalClass`、`CFBundleTypeRole`（Editor）等；並修正啟動順序（見 md-viewer-webview `main.go` / `menu.m` / `menu.go`）。

---

## final：DebugMode 開關 **(Done)**

**問題描述**  
除錯輸出希望可透過設定開關，不必改程式碼。

**預期行為**  
在設定面板可切換 **偵錯模式**；寫入 `~/.md-viewer/config.json`（`debugMode`）；Go `debugLog` 與前端 `console.log` 行為跟隨設定。

**修復方向**  
`config.json`、`SetDebugMode`、`saveDebugMode` 綁定、設定 UI checkbox、角標僅在偵錯時顯示。

---

## add new function：從翻譯後的 HTML 轉回 Markdown **(Done)**

**說明**  
支援在翻譯流程或結果處理中，將譯後 HTML 轉回 Markdown（供另存或後續管線使用）。  
（與先前 MyMemory 限制、改採 Google GTX 後備、錯誤比例報錯等翻譯管線強化一併落在同一專案迭代。）

**修復／實作方向**  
於翻譯結果路徑實作 HTML → Markdown 轉換與整合點。

---

## add new function：預設使用 Google 翻譯；來源語言預設自動偵測 **(Done)**

**說明**  
預設翻譯後端改為 **Google（GTX）**（或與 `TRANSLATE_BACKEND` 預設策略一致之穩定後端）；翻譯面板**來源語言**預設為 **自動偵測**，與預設 API 行為一致。

**修復／實作方向**  
後端預設值、環境變數與翻譯面板 `tp-source` 預設選項對齊。

---

## 參考文件

- T028-翻譯功能.md
- md-viewer-webview：`AGENTS.md`、`README.md`、`Info.plist.template`、`build.sh`

---

## issue.10 搜尋字串的定位色塊位移與導航失效 (Done)

**問題描述**  
1. 搜尋結果的高亮色塊在縮放 (Zoom) 時會位移，比例越大位移越嚴重。
2. 點擊「下一個」導航功能失效，無法持續跳轉到後續結果。
3. 當搜尋結果過多（如數千個）時，頁面渲染變得異常緩慢且導航卡頓。

**預期行為**  
1. 色塊應精確覆蓋搜尋字串，不受縮放影響。
2. 導航功能應能順暢循環跳轉所有結果。
3. 導航到的目標字串應盡量顯示在視窗中間。
4. 處理大量搜尋結果時應保持高效能。

**修復方向**  
1. **修正座標位移**：將高亮圖層 `#md-find-overlay-layer` 從 `document.body` 移至 `document.documentElement`，避開 CSS `zoom` 的雙重縮放效應。
2. **修復模板轉義**：在 `main.go` 中將 CSS/JS 內漏掉的 `%` 符號轉義為 `%%`，解決 `fmt.Sprintf` 造成的 JS 語法破壞。
3. **優化效能**：引入 **可視區域過濾 (Viewport Culling)**，只渲染目前視窗可見的高亮色塊。
4. **改善體驗**：調整 `scrollTo` 邏輯，將導航目標字串置中於視窗 (50%% 處)，並為選中目標加入 2px 亮藍色外框。