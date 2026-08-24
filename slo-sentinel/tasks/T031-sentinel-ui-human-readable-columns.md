---
github_issue: N/A
title: sentinel-ui 感測詳情欄位人話化——ETA 與用量呈現重設計
type: feat
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-26
updated: 2026-08-26

---

# T031 - sentinel-ui 感測詳情欄位人話化

## 目標
`cmd/sentinel-ui/main.go` 的 `/slo/{id}` 感測詳情頁：把工程中間量
（秒數浮點、null、科學記號）轉成人類可讀的呈現。純展示層改動——
不動 store schema、不動 sentinel API 契約。

## 背景
實測（docs/e2e-triage-drill-report.md §3）顯示目前欄位對人無意義：
`238.06299996376038 s`、`1.788e+09`、`-1 s`（null 的約定值）。

## 實作要點
1. 新增 `humanDur(sec *float64) string`：
   - `nil` → `無成長跡象`（引擎契約：斜率 ≤ ε 時 ETA 為 null）
   - `< 0` → `已越過天花板`
   - `< 120 分鐘` → `約 N 分鐘後觸頂`
   - `< 48 小時` → `約 N.N 小時後觸頂`
   - 其餘 → `約 N.N 天後觸頂`
2. 表頭改名：「ETA 激進(s)」→「激進預估（1 小時速率）」；
   「ETA 穩健(s)」→「穩健預估（最長窗速率）」
3. 實際值加千分位（`1.788e+09` → `1,788,000,000`）；感測單位未知，
   不虛構單位
4. 目錄版本移出主表，改為表格下方的小字註記（hash 對人無意義但保留可考）
5. 預測時間維持 GMT+8（沿用 fmtGMT8）

## 驗收標準
- [x] humanDur 邊界單元測試逐一斷言：nil、負值、0、90 分鐘、3 小時、72 小時、100 天七個案例的精確輸出字串
- [x] 實際值千分位格式化函式測試：0、1234567、負數三案例
- [x] 頁面渲染測試：fixture 含 null ETA、負 ETA、正常 ETA 三種列，斷言輸出分別為「無成長跡象」「已越過天花板」「約 N 分鐘後觸頂」
- [x] 主表不再出現「目錄版本」欄；頁尾註記含版本字串（有值時）
- [x] 既有 UI 測試全數通過（fixture 改以新表頭斷言）

## 備註
- 第二階段（當下使用率欄）見 T032；本任務不動 Prediction struct
- humanDur 語意對齊 daemon 端 formatForecastCard 的 humanDur，但不共用
  （跨 cmd 重複小函式優於新增內部套件；若日後第三處需要再抽）
