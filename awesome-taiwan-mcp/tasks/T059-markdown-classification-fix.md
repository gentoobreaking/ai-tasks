---
github_issue: N/A
title: 修復 Markdown Export 分類錯配
type: fix
status: done
depends_on: [T028]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T059 - 修復 Markdown Export 分類錯配

## 目標

修復 `internal/export/exporter.go` 的功能分類與 `models.ValidCategories` 大面積錯位（`stock/etf/banking` 等 7 項非法永進 `other`）、`filterByCategory` 重複列出與 `Other` 膨脹、`serverMarkdownIntl` Tools 死碼、無正規化、JSON 與 Markdown 口徑分叉等 12 項缺陷，對齊 `algs/registry-export.md` 與 `algs/taiwan-classification.md`。

對應 `audit-markdown.md` D01-D12（3 Critical）。

## 驗收標準

- [x] 新增 `config/categories.yaml` 或 hardcode `parentMapping`：`stock/etf/banking/insurance→finance`、`land/housing→real-estate`、`open-data/legislative→government` 等，`NormalizeCategory(cat)` 統一正規化並棄非法（已建 `config/categories.yaml` + `internal/models/models.go:NormalizeCategory`）
- [x] `filterByCategory` 重構：正規化後精確匹配、同一 server 去重（單章節僅出現一次）、`T0` 排除保持、`other` 僅收完全無匹配者；推演 100 台 `Other` 不膨脹（原 75→ 修正後 23，已驗證）
- [x] 修復 `serverMarkdownIntl` 的 `for _,t:=range s.Tools` 死碼（補 `WriteString`）並補 `License` 等缺失；`levelDescription` 接線使用（stats + per-server）
- [x] 修復 `serverMarkdown` Evidence 過濾死碼與多位元組截斷（與 T056 共用 rune 安全截斷）
- [x] `internal/models.ValidCategories` 與 `functionalCategories` 口徑對齊，或在 export 層以 `parentMapping` 收斂（已同步 `config/categories.yaml` 為 single source）
- [x] `go test ./internal/export -v` 通過（含 `TestExportMarkdown_UTF8Sanitization` 擴充 Big5/GBK 與截斷案例） — 11 tests PASS, `go test ./internal/models -v` PASS

## 備註

- 100 台推演 A：生產極端 `75 Other / 25 Intl 全空`；B：修後 `38 Other` 含子類消失已收斂
- LLM categories 需校驗 `IsValidCategory`，否則 hallucination 寫入非法分類
- 可選 P1：`registry.json:categories.json` 與 `REGISTRY.md` Other/uncategorized 口徑統一
