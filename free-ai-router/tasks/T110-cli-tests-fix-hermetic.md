---
github_issue: 
title: 修復 internal/cli 失效測試並隔離真實 HOME
type: test
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T110 - cli 測試修復與 hermetic 化

## 目標
internal/cli 有六個測試失敗，分兩類：
1. best 命令測試 fixture 的 resolveKey 回傳空字串——後來加入的 nokey
   跳過機制把 nvidia/groq 模型全標 nokey，FindBestModel 永遠找不到模型
2. add-provider 選單測試直接讀真實 ~/.freemodel-router.json，
   在沙盒/CI 環境假失敗

## 驗收標準
- [x] bestTestRegistry 回傳 dummy key，四個 best 測試復活（commit 099e519）
- [x] TestAddProviderUnknownListsTemplates / NoArgsShowsMenuAndCancels
      改用 EnvConfigPathVar 指向暫存檔 + DefaultConfig（commit e9981cf）
- [x] 全套 cli 測試綠燈

## 備註
教訓：engine 行為變更時要同步檢查測試 fixture 的前置假設。
