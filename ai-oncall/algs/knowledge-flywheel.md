# 知識飛輪與評測——RAG 沉澱與 Prompt 迭代規格

> **本檔為記憶體系與品質迴圈的唯一實作依據。** 任務拆解鐵律：凡實作
> `memory/{indexer,search}`、`evalkit/`、postmortem 入库的任務書，
> 驗收標準必須逐條引用本檔小節。
>
> 對應功能：F3 歷史比對、F9 知識沉澱、F16 評測機制與 Prompt 版本綁定
> 對應模組：`core/src/oncall_core/{memory,evalkit,brain}`

## D.1 RAG 檢索（讀取路徑）

- 語意嵌入 ＋ metadata 過濾並用：`service` / `cluster` / `severity` / `time_range`
  （沿數位分身 T030 metadata filtering 模式——純文字相似度會撈回不相干事故）
- 回傳附相似度排名；top_k 由呼叫端決定

## D.2 入库（寫入路徑）——三個來源

| 來源 | 內容 | 時機 |
|---|---|---|
| postmortem 定稿 | 人工修訂後結論（F8/F9） | resolved 後 |
| **即時 override** | 人類否決 AI 建議時的一句話「實際做法/原因」（algs/approval-executor.md §B.5） | 拒絕當下 |
| runbook 變更 | 目錄檔更新觸發重新索引 | git hook / 掃描 |

## D.3 evalkit 評測（F16）

1. 回放集：歷史已脫敏事故（≥20 件起跳），每件含「當時人工結論」為 ground truth
2. `evalkit replay`：離線重跑管線（shadow 路徑），對比 LLM 原因假設 vs ground truth
3. 輸出命中率報告：原因命中、建議可用率、平均 token 成本
4. **prompt_version 綁定鐵律**：每次分診紀錄帶 prompt_version；
   變更 prompt 必須附回放報告證明品質不降——品質下降的版本不得上線

## D.4 Shadow Mode 評分銜接（F15）

- shadow_reports/ 的人工評分結果寫入同一統計庫
- 上線門檻：≥30 份影子報告、原因正確率與建議可用率達設定門檻（spec.md §5 標準 11）

## D.5 隱私

- 回放集與入库內容須先過遮蔽層（同 algs/approval-executor.md §B.4 樣式掃描）
