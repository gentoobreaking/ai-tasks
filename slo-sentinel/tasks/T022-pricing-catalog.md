---
github_issue: N/A
title: 價目表目錄 internal/pricing（estimate 模式主路徑）
type: feat
priority: high
status: pending
depends_on:
- T001
- T003
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24

---

# T022 - 價目表目錄 internal/pricing（estimate 模式主路徑）

> **T022 修訂新增**：成本可見性的主路徑不依賴 billing IAM——
> 以公開價目表 × Prometheus 用量指標推估花費（algs/cost-forecast.md §D.0）。
> 維護人員無需任何雲端權限即可使用成本功能。

## 目標
`internal/pricing`：下載、解析、快取公開價目表，提供「用量指標 → 單價」查詢：
1. **AWS Price List Bulk API**：抓 `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json`
   → 定位目標 region/服務的 offer 檔（如 AmazonEC2 current/us-east-1）→
   串流解析（檔案大，禁止一次性載入）
2. **AWS Price List Query API**：免認證查詢單一服務/region 的 SKU 單價（輕量首選）
3. **阿里雲 QuerySkuPriceList**（BSSOpenAPI）：唯讀 RAM key 簽名呼叫，
   取 ECS/儲存等 SKU 單價（非 billing 管理權即可）
4. 本地快取：下載結果存 SQLite/檔案，依 TTL 刷新（AWS 官方每日多次更新；
   阿里雲建議每日一次）

## 驗收標準
- [ ] index.json 解析：給定 service+region 能定位 offer 檔 URL（以 fixture 測試，不下載真實大檔）
- [ ] offer 檔串流解析：json.Decoder 逐步處理 products/terms，記憶體峰值有上限測試
- [ ] Price List Query API：無認證請求 + filter（region/instanceType）回應解析，httptest 覆蓋
- [ ] 阿里雲 QuerySkuPriceList：RPC 簽名呼叫 + 回應解析，fake server 測試
- [ ] 快取層：TTL 內不重複下載；離線時使用過期快取並標注 stale
- [ ] 查詢介面：`Price(sensorKind, attrs) (unitPrice, currency, error)`——
      供 cost 引擎以「用量 × 單價」推估（對接 T011 estimate 模式）
- [ ] 全套測試離線可跑（fixture/mock）

## 備註
- AWS 公開價目表無需認證；阿里雲需唯讀 RAM key（非 billing 管理權）——
  金鑰管理與其他 env var 同慣例
- 價目表結構複雜（SKU/offerCode/terms 索引），v1 先支援固定家族：
  EC2 按時租、EBS 每 GB、RDS 連線/儲存；其餘列 v2
- 對應規格：spec.md F11 雙模式；演算法：algs/cost-forecast.md §D.0
