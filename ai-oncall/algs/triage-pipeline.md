# 分診管線——主流程邏輯規格

> **本檔為管線編排的唯一實作依據。** 任務拆解鐵律：凡實作 `brain/triage.py`、
> `incident/correlate.go(py)`、`interact/` 的任務書，驗收標準必須逐條引用本檔小節。
>
> 對應功能：F4 診斷建議、F10 警報風暴聚合、F11 成本護欄、F15 Shadow Mode
> 對應模組：`core/src/oncall_core/{incident,brain,interact}`

## A.1 主流程（含取消檢查點）

```mermaid
flowchart TD
    A[AlertManager webhook] --> B[ingest 正規化為 AlertEvent]
    B --> C{correlate 聚合判定：\n標籤相似度 + 時間窗（5m）\n可歸入既有 Incident?}
    C -- 是 --> D[併入既有 Incident 的訊號列表\n時間線追加，不重跑分診]
    C -- 否 --> E[建立新 Incident\n狀態: open]
    E --> F[context 收集器並行拉取:\n指標 / 最近部署 / HPA軌跡 / quota快照 / log摘要]
    F --> G{{取消檢查點 ①:\nIncident 仍 open/investigating?\ncollector 全失敗→降級模式標注}}
    G -- 中止 --> X[(記錄: 自我緩解/已聚合)]
    G -- 繼續 --> H[memory RAG 檢索:\n歷史相似事故 + 相關 runbook]
    H --> I{{取消檢查點 ② + token 預算檢查}}
    I -- 中止 --> X
    I -- 繼續 --> J[brain 分診:\nLLM 產出原因假設排序 + 建議動作\n每項標注風險等級；缺漏 context 明列]
    J --> K[notify 推播 Telegram:\n分診報告卡]
    K --> L{人類決策}
```

## A.2 聚合演算法（v1 最簡版）

- 新警報與**過去 5 分鐘內的未結 Incident** 比較 `cluster`/`service`/`severity`
  標籤交集 ≥2 即併入；無命中才新建 Incident
- 併入時時間線追加事件、不重跑分診；若 Incident 已進入 mitigated 則只記錄不重開
- v2 再考慮文字嵌入相似度

## A.3 取消檢查點

| 檢查點 | 位置 | 條件 | 動作 |
|---|---|---|---|
| ① | context 收集完成後 | Incident 狀態 ∉ {open, investigating} | 中止，時間線記「自我緩解」 |
| ② | RAG 完成後、LLM 呼叫前 | 同上 ＋ token 預算剩餘 >0 | 同上 |

- 每次 LLM 呼叫包在可取消 context 中；取消時已耗 token 仍計入成本統計

## A.4 成本護欄（F11）

- 每 Incident 的 LLM 呼叫次數上限（預設 6 次）與 token 上限（YAML 可調）
- 超限降級：不再呼叫 LLM，改推純 context 摘要＋歷史相似事故連結
- 所有消耗入 `/metrics`

## A.5 降級模式

- Prometheus/Loki collector 全失敗 → 分診照常執行，
  但報告必須明列「本次缺少哪些 context」，禁止 LLM 幻覺補完缺失資訊
- 部分失敗 → 缺漏區塊標注 `unavailable`，其餘正常

## A.6 Shadow Mode（F15）

- 全域旗標 `SHADOW_MODE=1`：管線完整執行至分診報告產出
- 「推播」改寫入 `shadow_reports/{incident_id}.md`；executor 一律跳過
- 目的：上線前累積 ≥30 份影子報告供人工評分（見 algs/eval-shadow.md）
