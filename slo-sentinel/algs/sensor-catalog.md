# 感測目錄——Prometheus Rules 格式與 sentinel 擴充慣例

> **本檔為演算法規格，是對應模組的唯一實作依據。**
> **任務拆解鐵律**：凡實作下列功能/模組的任務書（T00X），其「驗收標準」必須
> 逐條引用本檔對應小節（例：「公式與觸發條件依 `algs/` §X」），
> 未引用視為任務書不完整。
>
> 對應功能：F8 容量感測目錄、F14 瘦身與閒置偵測的條目格式
> 對應模組：`internal/catalog/`
>

## C.1 感測目錄——以 Prometheus Rules 檔案為基底

> 對應功能：F8；對應模組：`internal/catalog/`

### 通知架構定案（直推中心，修訂自原「兩段式寫回」設計）

```
【零碼過渡期】sentinel 尚未上線時：
    predict_linear 基線規則 → AlertManager → 既有通知鏈
    （OLS 單窗外插，會被脈衝誤導，但零依賴可先用）

【正式期】sentinel daemon 上線後：
    引擎計算 → 狀態機 → ★ sentinel 直推 Telegram 人話卡（唯一通知路徑）
    amcoord 查 AM：Sloth 靜態告警已 firing 者 → 靜默（防雙重通知）
    基線規則建議停用或收窄（由 amcoord 自動協調，亦可手動移除）

    /metrics 端點仍暴露 eta/狀態指標——僅供 Grafana 觀測與自我監控，
    ★ 不作為任何告警規則的輸入（通知只有直推一條路，杜絕雙重通知）
```

> **修訂理由**：原「兩段式寫回」會造成同一事件雙路通知（直推卡＋AM 告警），
> 且 AM template 做不出雙視野人話卡。定案：通知一律直推；rules 檔案中的
> 容量告警規則在 sentinel 上線後由 amcoord 協調靜默。

### C.2 為什麼站在標準格式上

| 收益 | 說明 |
|---|---|
| 零學習成本 | 格式就是業界標準；promtool 直接驗證語法 |
| 現成種子庫 | [awesome-prometheus-alerts](https://github.com/samber/awesome-prometheus-alerts) 等社群規則集數百條現成規則可取材 patch |
| 與 Sloth 同構 | Sloth 生成的本來就是 rules 檔案——SLO 告警與容量感測**同一格式、同一目錄、同一次載入** |
| 告警對象/訊息原生支援 | `labels`（team/scope/severity）即告警路由；`annotations` 即告警訊息模板——不用另設欄位 |
| 熱載入免實作 | Prometheus 自己 watch rules 檔；sentinel 對同一批檔案做 fsnotify 即可 |

### C.3 檔案佈局與 sentinel 擴充慣例

```
rules.d/
├── sloth-generated/           # Sloth 生成的 SLO 規則（上游，唯讀）
├── community/                 # 取自 awesome-prometheus-alerts 的最新版規則（記錄上游版本）
│   ├── k8s.yaml  cloud-quota.yaml  node.yaml ...
├── local/
│   └── capacity-sensors.yaml  # ★ 本專案的容量感測（patch 自 community + sentinel 註解）
└── tests/                     # promtool test rules 的單元測試（規則也要有測試）
```

容量感測以「recording rules 正規化 + alert 規則觸發」兩段式表達，
sentinel 擴充資訊全部放 `labels` / `annotations`（字串鍵值，不破壞標準格式）：

```yaml
groups:
- name: capacity.cloud.hpa
  rules:
  # ── 感測層：正規化為 sentinel 統一命名（供 ETA 引擎與 UI 讀取）──
  - record: sentinel_capacity_used
    expr: kube_horizontalpodautoscaler_status_current_replicas{*}
  - record: sentinel_capacity_ceiling
    expr: kube_horizontalpodautoscaler_spec_max_replicas{*}

  # ── 零碼基線：vanilla PromQL 就能做的 ETA（predict_linear = 內建 OLS 外插）──
  - alert: CapacityEtaWarningBaseline
    expr: |
      predict_linear(
        sentinel_capacity_used[6h] / sentinel_capacity_ceiling[6h], 72*3600) >= 1
    for: 10m
    labels:
      scope: cloud
      severity: warning
      team: platform                      # ← 告警對象：AlertManager router 依此分流
    annotations:
      summary: "{{ $labels.namespace }}/{{ $labels.hpa }} 預計 72h 內觸頂"
      runbook_url: "https://runbooks.example.com/capacity-hpa"

  # ── 進階版：sentinel 引擎接手後啟用的 Theil–Sen 多視野（見 §6.3）──
  - alert: CapacityEtaRobust
    expr: sentinel_eta_aggressive_hours <= 6     # sentinel 引擎算好後經 /metrics 暴露（僅觀測）的指標
    for: 10m
    labels: {severity: critical, scope: cloud, team: platform}
    annotations:
      summary: "{{ $labels.sensor }} 激進視野 {{ $value | humanize }}h 後觸頂"
      sentinel_sensor: cloud.k8s.hpa.headroom   # ← sentinel 擴充：關聯感測 id
```

> **兩段式設計的意義**：`predict_linear` 是 OLS、單窗——零依賴即可上線（§6.7 提過
> 它會被脈衝誤導）。sentinel daemon 啟用後讀取同一批 `sentinel_capacity_*` 系列，
> 用 §6.2–6.3 的 Theil–Sen 多視野引擎算出更穩健的 ETA，改由 daemon 直推人話卡。
> （此段為原設計殘留說明，已被上方「通知架構定案」取代。）

### C.4 告警對象與告警訊息（全在標準欄位內）

| 需求 | 標準機制 |
|---|---|
| 告警對象（誰收到） | `labels.team/service/scope` → AlertManager route 分流到不同 Telegram chat／email |
| 告警訊息（說什麼） | `annotations.summary/description/runbook_url`，Go template 可引用 `$labels`/`$value` |
| 通知去重/靜默 | AlertManager 原生 group_by/inhibit/silence——**sentinel 的 amcoord 只需比對同一來源**，雙重通知問題從根上消失 |
| sentinel 推播格式化 | daemon 直推人話卡（含雙視野 ETA）；firing alert 的 `annotations` 作為 amcoord 比對來源 |
| `/metrics` 定位 | **僅觀測用**（Grafana 畫 ETA 曲線、自我監控）——不是告警規則的輸入，避免雙路通知 |

### C.5 動態調整的三條路

| 途徑 | 機制 |
|---|---|
| 人工·手改 | 編輯 `rules.d/local/*.yaml` 存檔；Prometheus 與 sentinel 各自 fsnotify 熱載入，免重啟 |
| 人工·CLI | `sentinel rules lint`（包 promtool）、`list`、`enable/disable`（打 label 而非刪除） |
| 自動·上游同步 | `community/` 目錄由腳本定期拉 awesome-prometheus-alerts 最新版，diff 後人工審查 patch；K8s 環境可用 sloth operator / discovery 自動生成 |

### C.6 安全與防呆

| 規則 | 說明 |
|---|---|
| 語法驗證 | 載入前跑 `promtool check rules`；失敗整檔隔離並 log.warning，不拖垮 daemon |
| 上游版本固定 | `community/` 記錄來源 repo 的 commit hash；升級走 PR 流程人工審差異 |
| sentinel 註解隔離 | 所有 `sentinel_*` 前綴的 label/annotation 僅供 sentinel 消費；AlertManager 忽略之，移除 sentinel 不影響標準告警 |
| 變更審計 | 熱載入記錄 diff；預測紀錄帶規則檔版本，`/accuracy` 可對比調整前後命中率 |

---

