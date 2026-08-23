# 容量 ETA 前驅預警——演算法規格

> **本檔為演算法規格，是對應模組的唯一實作依據。**
> **任務拆解鐵律**：凡實作下列功能/模組的任務書（T00X），其「驗收標準」必須
> 逐條引用本檔對應小節（例：「公式與觸發條件依 `algs/capacity-eta.md` §X」），
> 未引用視為任務書不完整。
>
> 對應功能：F2 多視野 ETA、F9 容量觸頂預警
> 對應模組：`internal/budget/ + capacity/`
>

### A.1 符號與名詞

| 符號 | 意義 |
|---|---|
| `m(t)` | 容量消耗指標在時刻 t 的值（PromQL 查詢結果） |
| `C(t)` | 硬頂（hard ceiling）。**可為動態查詢**——雲端場景的 max replicas / quota 本身會變，故天花板也是一條 PromQL |
| `H(t)` | 剩餘餘量 `= C(t) − m(t)` |
| `U(t)` | 使用率比 `= m(t) / C(t)`，∈ [0,∞) |
| `W` | 迴歸視野窗 ∈ {1h, 6h, 3d}（激進→穩健） |
| `β_W` | 視野窗 W 內的消耗速率估計（單位/秒） |
| `ETA_W` | 以 W 的速率外插，觸及硬頂的剩餘時間 |

### A.2 消耗速率估計：Theil–Sen 穩健斜率

**不用最小平方法**。脈衝式消耗（一次壞部署燒掉 5%）會讓 OLS 斜率被單點拉歪。
採用 Theil–Sen：取視野窗內所有樣本兩兩配對斜率的中位數。

```
樣本集 S = {(t₁,y₁), …, (tₙ,yₙ)}，取自視野窗 W（查詢間隔 60s）
β_W = median{ (yⱼ − yᵢ) / (tⱼ − tᵢ) : 所有 i < j }
```

- 特性：可容忍 ≤29% 的離群點而不失真；n≤200 時 O(n²) 計算成本可忽略
- 對照組保留 OLS 實作（feature flag 切換），`/accuracy` 頁面比較兩者命中率

### A.3 多視野 ETA 公式

```
對每個視野窗 W：
    若 β_W > ε（ε=極小正數，濾除噪聲）：
        ETA_W = H(t₀) / β_W        # t₀ = 現在
    否則：
        ETA_W = ∞                   # 未成長或下降，該視野無風險

輸出並陳：
    aggressive = ETA_1h             # 「最壞多快」——反應爆量
    conservative = ETA_3d           # 「常態下還有多久」——過濾一次性脈衝
```

> **零碼基線**：vanilla PromQL 的 `predict_linear()` 即 OLS 外插——規則檔裡先用它上線，
> sentinel 引擎啟用後升級為 Theil–Sen 多視野（兩段式基線/進階設計見 `algs/sensor-catalog.md` §C.1）。
>
> **為什麼仍拒絕以 OLS 單窗作為最終方案**：一次尖峰讓 1h 速率暴增 → 預測「2 小時後燒穿」，
> 半夜叫醒人，結果流量退了就沒事。雙視野並陳把「最壞情境」與「常態趨勢」
> 分開呈現，判斷權留給人；機器只負責兩者都算出來。

### A.4 觸發條件（預設值，YAML 可覆寫）

| 狀態 | 進入條件（任一滿足） | 解除條件 |
|---|---|---|
| **warning** | `ETA_aggressive < T_warn(=72h)` **且** `U(t) ≥ soft/C`；**或** `ETA_conservative < T_warn(=72h)` | 預測回到門檻之外持續 2 個輪詢週期 |
| **critical** | `ETA_aggressive < T_crit(=6h)` 或 `U(t) ≥ 0.95` | 降回 warning |

> 注意 warning 條件的第二條：`U` 很低（如磁碟只用 30%）但成長飛快
> （ETA_conservative < 72h）**同樣觸發**——這正是「前驅預警」相對靜態閾值的價值。

### A.5 採樣有效性校驗（不滿足則本輪「不預測」，沿用上次狀態）

| 規則 | 預設值 | 防的坑 |
|---|---|---|
| 最少樣本數 | 每 1h 視野 ≥50 點、6h ≥300、3d ≥3600（60s 間隔的 83%） | 冷啟動/Prometheus 重啟後拿垃圾外插 |
| 最大資料間隙 | >5 分鐘的缺口使「跨越缺口的配對」不納入斜率計算 | scrape 中斷造成假斜率 |
| 天花板跳變偵測 | `C(t)` 相較上次變化 >1% → 清空所有視野快取，重新累積 | 擴容後舊斜率全部失效 |
| 視窗重置邊界 | SLO 型指標遇 28d 滾動重置 → 同上清空 | 重置瞬間 ETA 跳變誤報 |

### A.6 虛擬碼

```text
每輪詢週期（60s），對每個 capacity 定義 d：
    m  = promql(d.metric)
    Ch = promql(d.ceiling)          # 動態天花板
    if Ch 跳變: 清空該定義所有視野快取; continue

    將 (now, m) 附加至 ring buffer

    for W in {1h, 6h, 3d}:
        S = 有效樣本（套用 6.5 校驗）
        if 不滿足最少樣本數: ETA_W = UNKNOWN; continue
        β_W = theil_sen_slope(S)
        ETA_W = (Ch − m)/β_W  若 β_W > ε  否則 ∞

    state = evaluate(d, ETA_aggressive, ETA_conservative, U)   # 依 6.4
    if state 轉入 warning/critical 且 amcoord 無重疊告警:
        telegram(format(d, ETA_aggressive, ETA_conservative, U))
    store.append_prediction(d, now, ETA_*, m)                  # 供 /accuracy 自評
```

### A.7 數值例

磁碟監控：`C = 500GB`，現值 `m = 150GB`（U=30%，靜態閾值毫無動靜）。

```
近 1h 樣本斜率  β₁ₕ = 2.0 GB/min  → ETA_aggressive   = 350/2.0 = 175 分鐘 ≈ 2.9h
近 3d 樣本斜率  β₃d = 0.05 GB/min → ETA_conservative = 350/0.05 = 7000 分鐘 ≈ 4.9 天
```

推播：「⚠️ data-disk 使用率 30%（未達靜態警戒）——但若維持最近一小時的速度，
**約 2.9 小時後寫滿**；若屬一次性爆量、回到三日均值，則約 4.9 天。」
→ 收件人一眼看出「這是脈衝還是趨勢」，決定要不要起來處理。

