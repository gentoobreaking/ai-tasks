# 營運成本推估——演算法規格

> **本檔為演算法規格，是對應模組的唯一實作依據。**
> **任務拆解鐵律**：凡實作下列功能/模組的任務書（T00X），其「驗收標準」必須
> 逐條引用本檔對應小節（例：「公式與觸發條件依 `algs/cost-forecast.md` §X」），
> 未引用視為任務書不完整。
>
> 對應功能：F11 成本感測、F12 預算天花板與 ETA、F13 推估報表
> 對應模組：`internal/billing/ + cost/`
>



### D.1 資料源與延遲特性（誠實前提）

| 來源 | 粒度 | 延遲 | 備註 |
|---|---|---|---|
| AWS Cost Explorer API | DAILY | ~24h（當日帳務隔天才準） | `GetCostAndUse`，可 filter by service/tag/account |
| AWS CUR Data Export | HOUR/DAILY | S3 交付延遲數小時～1 天 | 大量分析用；v1 先用 CE 即可 |
| AlibabaCloud BSS | DAILY | ~24h | `QueryInstanceBill` / `DescribeInstanceBill` |

> **鐵律：所有「今日」成本其實是昨日的。** UI 與推播必須標注資料截止時間，
> 推估值一律以「已確認帳務的最後一天」為基準點，不假裝即時。

### D.2 核心公式

**符號**：`S(t)` = 截至日期 t 的月初至今（MTD）累積花費；`B` = 月度預算；
`d_elapsed` = 本月已過天數；`d_total` = 本月總天數；`r_W` = 視野窗 W 的日花費速率。

```
【日速率】（雙視野，同 §6.3 拒絕單窗）
    r_recent = mean(近 7 天日花費)          # 反映近期變化（擴容/新服務上線）
    r_mtd    = S(today) / d_elapsed         # 全月均值——被月初平滑
    兩者並陳；推播時同樣「最壞/常態」並列

【月底推估】
    projected_EOM = S + r × (d_total − d_elapsed)
      aggressive: 用 r_recent     conservative: 用 r_mtd

【預算 ETA】（重用 §6.3 引擎，天花板=B）
    ETA_budget = (B − S) / r                # r > ε 才有意義
    → 餵進同一顆狀態機（healthy/warning/critical）與 Telegram 推播

【年推估】
    projected_year = Σ(已完成月實際值) + Σ(未完成月 projected_EOM)
    已滿一年的服務另提供「去年同月對比 YoY%」

【容量連動推估】（F9 × F13 協同）
    若 capacity 感測預測副本數將從 N₀ 成長到 N₁：
        Δcost/h = (N₁ − N₀) × unit_price_per_hour
        併入 r_recent 後重算 projected_EOM —— 容量預警附帶「這個決定每月多花多少錢」
```

### D.3 觸發條件（成本版狀態機）

| 狀態 | 進入條件（任一） |
|---|---|
| warning | `ETA_budget < 240h`（照目前速度本月內會燒穿）或 MTD 已達預算 80% 且尚未月中 |
| critical | `ETA_budget < 48h` 或單日花費 > 日均預算 2 倍（爆衝偵測——新服務忘關、流量異常） |

> 爆衝偵測獨立於預算：即使預算很大，「單日突然 2 倍」也值得知道——通常代表配置錯誤。

### D.4 v1 範圍限制（誠實聲明）

- 只做 **unblended cost**（未攤銷）；RI/Savings Plans 攤銷、分層定價、稅項為 v2+
- 多幣別只記原幣＋一個設定匯率換算（即時匯率外掛為 v2）
- 標籤分配（依 team/project 分帳）依賴資源打標紀律，工具不做強制

### D.5 UI / 推播輸出

- `/cost` 頁面：各服務 MTD vs 預算燃盡圖（同 SLO 燃盡視覺）、月/年推估表、YoY 對比
- Telegram：warning/critical 觸發推播＋每週一封成本摘要（含 top 5 成長服務與原因猜測——成長來源比對 capacity 感測的擴容軌跡）

---

