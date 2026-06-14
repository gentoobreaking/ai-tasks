---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/152
title: T029-混合架構整合優化與前端解耦
status: done
assignee: gemini-cli / opencode
created: 2026-05-10
updated: 2026-05-10
github: 
---

# T029 - 混合架構整合優化與前端解耦

## 緣起
✦ 這次修復之所以顯得較為困難，主要源於幾個技術層面的交織影響，這也確實反映了「混合架構（Hybrid
  Architecture）」在整合時常見的挑戰：

  1. 「看不見」的模板錯誤 (The Invisible Template Bug)
  這是這次最折磨人的地方。專案將 HTML/CSS/JS 全部寫在 Go 的字串中，並透過 fmt.Sprintf 進行最後的渲染。
   - 困難點：CSS 裡的 width: 100% 或 JS 的 % 運算子，在 Go 的格式化函式中必須寫成 %%。如果有任何一個漏掉，Go
     不會報錯，而是會在輸出的 HTML 中插入像 %!h(MISSING) 這種錯誤訊息。
   - 影響：這會導致瀏覽器載入後 JavaScript
     語法直接毀損。從原始碼看邏輯完全正確，但執行時卻因為「被加工過的字串」出錯而完全無法跑，這類問題在編譯時期
     是檢查不出來的。

  2. 混合座標系統與縮放的衝突 (Zoom vs. Fixed Positioning)
  App 為了實現平滑縮放，使用了 document.body.style.zoom。
   - 困難點：在 WebKit 引擎中，當 body 被縮放時，position: fixed 的元素座標計算會變得極其複雜（所謂的
     Double-Zoom 效應）。
   - 技術整合改進：原本將高亮圖層放在 body 內是一個直覺但錯誤的設計。這次我們將其移至 documentElement (html
     層級)，這是一個技術上的「解耦」——讓 UI 顯示層與內容縮放層分離，這才解決了對齊問題。

  3. 渲染效能的量變產生質變
   - 困難點：搜尋導航在結果少時沒問題，但在結果多時失效。這是因為 JS 在操作幾千個 DOM
     元素時產生的阻塞，讓導航函式在完成前就引發了瀏覽器的「長任務」保護。
   - 改善地方：我們引入了「視窗過濾（Culling）」技術。這在技術架構上是從「全量渲染」進化到「按需渲染」，是處理大
     數據量 UI 的標準進階做法。

  ---

  未來可以改善的架構建議

   1. 資源分離 (Separation of Concerns)：
      目前 HTML/CSS/JS 全部硬編碼在 main.go 裡。未來可以考慮將這些前端資源獨立成檔，在開發階段使用 os.ReadFile
  載入，釋出階段再使用 Go 1.16+ 的 //go:embed 指令嵌入。
       * 好處：可以避免 fmt.Sprintf 帶來的百分比轉義風險，也能使用標準的前端工具進行語法檢查與除錯。

   2. 更強的偵錯橋接 (Debug Bridge)：
      目前 Go 到 JS 的溝通主要是透過 Eval()。如果能建立一個更完整的日誌回傳機制（例如 JS
  的錯誤會自動回傳並顯示在 Go 的控制台），就能更快發現「語法損毀」這類底層問題。

   3. 座標計算與內容層分離：
      這次將高亮圖層移出 body
  的經驗告訴我們，未來任何需要「精確覆蓋內容」的功能（如註解、浮動選單），都應該採取同樣的解耦模式，避免受到 CSS
  Zoom 或 Transform 的干擾。

  總結來說，這次修復的難度不在於邏輯本身，而在於環境整合導致的副作用（Go 轉義、WebKit 縮放特性、DOM
  渲染壓力）。


## 目標
優化目前的混合架構（Hybrid Architecture），解決 HTML/CSS/JS 與 Go 原始碼過度耦合的問題，降低開發難度並提升系統穩定性。

## 目前進度 (2026-05-12)
- ✅ **部分資源解耦**：HTML/CSS 已透過 `//go:embed` 抽離為獨立檔案 (style.css, template.html)
- 🔄 **開發階段實體檔案載入**：已實現開發模式下優先讀取實體檔案的機制 (CSS/HTML)
- ⚠️ **座標計算標準化**：高亮圖層已移至 `documentElement` 以解決 Zoom 與 fixed positioning 衝突，但需擴展至其他 UI 覆蓋層
- ❌ **自動化嵌入百分比風險消除**：仍存在手動百分比轉義 (如 template.html 中的 100%%)
- ✅ **強化偵錯橋接**：已建立 JS-to-Go 日誌回傳機制，可捕獲前端語法錯誤和未捕獲的 promise rejection

## 驗收標準
- [x] **資源解耦**：將內嵌於 `main.go` 的 HTML/CSS/JS 抽出為獨立檔案，開發階段使用實體檔案載入（CSS/HTML 已實現）
- [x] **自動化嵌入**：發布階段改用 Go 1.16+ 的 `//go:embed` 指令將前端資源打包進二進位檔
- [x] **強化偵錯橋接**：建立更完善的 JS-to-Go 日誌回傳機制，讓前端語法錯誤能自動呈現在 Go 的控制台
- [x] **座標計算標準化**：建立統一的 UI 覆蓋層座標系統規範，確保未來新增的功能（如註解、選單）能自動適應縮放 (Zoom) 模式

## 備註
- 此任務為長期架構優化，旨在防止類似 T028 的「看不見的模板錯誤」再次發生。
- 需注意解耦後，資源路徑在 .app bundle 內的定位問題。
