---
github_issue: N/A
title: capacity_defs／slo_defs 熱載入
type: feat
priority: medium
status: done
depends_on:
- T005
- T009
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-26

---

# T028 - capacity_defs／slo_defs 熱載入

## 背景（不對稱）
rules.d 已有 fsnotify 熱載入（改檔 → 下一輪以新目錄重建感測器），
但 `slo_defs/` 與 `capacity_defs/` 只在啟動時載入——改感測定義必須重啟
daemon。dev profile 實測時即遇到此摩擦（改 node-disk.yaml 需手動 restart）。

## 目標
三個定義目錄行為一致：檔案變更 → 下一輪輪詢自動生效，免重啟。

## 實作要點
1. 沿用 rules.d 的 Watch 模式（fsnotify＋防抖）；或抽公共 watcher helper
   供三個目錄共用（避免三份近似程式碼）
2. 變更後走既有 `setupSensors` 重建路徑（已可重入）
3. 失敗處理與 rules.d 一致：新檔解析失敗保留舊感測、log 錯誤不中斷
4. 注意：重建感測器會清空引擎快取——文件標注此副作用

## 驗收標準
- [x] 新增／修改／刪除 def 檔後 60 秒內生效（無需重啟）
- [x] 解析失敗的新檔不影響既有感測運作（log 錯誤）
- [x] 三個目錄行為一致；watcher 無洩漏（重複變更不疊加 goroutine）
- [x] README「capacity_defs 非熱載入需重啟」的注意事項移除

## 備註
macOS Docker Desktop 的 bind mount fsnotify 事件可能不可靠
（virtiofs）——驗收需在 Linux 或確認事件可達；不可達時降級為
定期 stat mtime 檢查。
