---
github_issue: ""
title: Pipeline Resume 支援（斷點續傳）
type: feature
priority: low
status: done
assignee: pi with opencode/x-preview-f-free
created: 2026-08-22
updated: 2026-08-22
---

# T030: Pipeline Resume 支援（斷點續傳）

## 背景
目前 `PipelineRunner.run()` 只有兩種模式：
- 有 FROZEN → 完全跳過
- 無 FROZEN → 清理所有 PENDING，從 `collect` 重新開始

無法處理「中途失敗後從失敗階段續跑」的情況。

## 難度評估：中等偏高

### 技術挑戰
| 項目 | 說明 | 難度 |
|------|------|------|
| **狀態持久化** | 需在 `analysis_snapshot` 新增欄位記錄各階段狀態（PENDING/RUNNING/COMPLETED/FAILED） | 中 |
| **輸入資料完整性** | Resume 時需驗證上游階段產出是否完整（如 factor_scores 是否齊全） | 高 |
| **冪等性** | 階段 handler 需支援重複執行不產生副作用（upsert vs insert） | 中 |
| **錯誤分類** | 需區分「可重試錯誤」（網路、rate limit）vs「不可重試錯誤」（邏輯 bug、資料缺失） | 中 |
| **併發安全** | 同一 snapshot_id 同時被多處執行時的鎖機制 | 高 |

### 架構影響
- `PipelineRunner.run()` 需大幅重構：從線性執行改為狀態機
- `PipelineResult` 需包含 `stage_status: dict[str, StageStatus]`
- 所有 stage handler 需檢查 `dry_run` 外，還要處理「已存在資料」情況
- 需新增 CLI：`twquant daily --resume <snapshot_id>`

---

## 具體實作計畫

### Phase 1: 資料模型擴充
```sql
-- analysis_snapshot 新增欄位
ALTER TABLE analysis_snapshot ADD COLUMN stage_status jsonb DEFAULT '{}';
-- 例: {"collect": "COMPLETED", "validate": "FAILED", "calculate": "PENDING", ...}

-- 或獨立表 pipeline_stage_log
CREATE TABLE pipeline_stage_log (
    snapshot_id varchar(30) REFERENCES analysis_snapshot(snapshot_id),
    stage varchar(20),
    status varchar(20),  -- PENDING/RUNNING/COMPLETED/FAILED
    started_at timestamptz,
    completed_at timestamptz,
    error text,
    metrics jsonb,
    PRIMARY KEY (snapshot_id, stage)
);
```

### Phase 2: PipelineRunner.run() 重構
```python
def run(self, market_date: date | None = None, resume_snapshot_id: str | None = None) -> PipelineResult:
    if resume_snapshot_id:
        # 1. 載入現有 snapshot 的 stage_status
        # 2. 找出第一個 FAILED 或 PENDING 階段
        # 3. 驗證上游階段輸出完整性
        # 4. 從該階段開始執行
    else:
        # 現有邏輯（檢查 FROZEN、清理 PENDING、從 collect 開始）
```

### Phase 3: Stage Handler 改造
每個 handler 需：
```python
def _stage_calculate(conn, ctx, market_date, dry_run, resume: bool = False):
    if resume:
        # 檢查 factor_scores 是否已有資料
        existing = count_factor_scores(conn, ctx.snapshot_id)
        if existing > 0:
            logger.info("factor_scores 已有 %d 筆，略過重算", existing)
            return {"records": existing, "resumed": True}
    # 正常執行...
```

### Phase 4: CLI 整合
```bash
twquant daily --resume 20260822-063137-dc1927
twquant daily --resume-from calculate  # 從指定階段重跑
```

---

## 風險與緩解

| 風險 | 緩解 |
|------|------|
| Resume 時上游資料不完整導致下游算錯 | Resume 前強制驗證上游產出筆數、關鍵欄位非空 |
| 部分階段不可冪等（如 alert 會重複寫入） | 所有寫入改用 `ON CONFLICT DO UPDATE` 或先刪後寫 |
| 併發執行導致資料競爭 | 用 `SELECT ... FOR UPDATE SKIP LOCKED` 鎖住 snapshot |
| 測試複雜度爆增 | 先寫整合測試覆蓋：失敗→resume→完成、中斷→resume 等場景 |

---

## 建議實作順序

1. **最小可行版**：只支援「從失敗階段重跑」，不驗證上游完整性（風險自負）
2. **加入驗證**：resume 前檢查上游必要表有資料
3. **完善冪等**：所有 handler 支援 resume 參數
4. **CLI & 監控**：加入 `--resume` 參數、stage 級別 metrics

---

## 替代方案（若 resume 太複雜）

| 方案 | 優點 | 缺點 |
|------|------|------|
| **現狀維持：失敗即全刪重跑** | 簡單、資料一致性強 | 浪費時間（collect/validate 重跑） |
| **分階段手動觸發** | `twquant collect` → `twquant validate` → ... 手動控制 | 需人工介入，不適合自動化 |
| **外部工作流引擎** | Airflow/Prefect/Temporal 內建 retry/resume | 引入重依賴，過度設計 |

---

## 相關檔案
- `pipeline_runner.py` - 核心邏輯
- `snapshot/lifecycle.py` - snapshot 狀態管理
- `cli/main.py` - CLI 參數
- `scripts/auto_daily.py` - 自動觸發邏輯

---

## 先決條件
- [x] T029 完成（交易日預設值修正）
- [x] 資料庫遷移腳本（schema 變更）：`db/migrations/006_pipeline_stage_log.sql` + 執行期 `ensure_stage_log_table()` 冪等建表
- [x] 整合測試環境可跑完整 pipeline：unit 測試以 FakeConn 覆蓋 resume 全流程

## 完成摘要（2026-08-22）
- 新增 `snapshot/stage_log.py`：pipeline_stage_log 表管理（PENDING/RUNNING/COMPLETED/FAILED、upsert、load_stage_status、find_resume_stage）
- 新增遷移 `db/migrations/006_pipeline_stage_log.sql`
- `PipelineRunner.run()` 支援 `resume_snapshot_id` / `resume_from`：
  - 從 pipeline_stage_log 找第一個非 COMPLETED 階段續跑（跳過 FROZEN 檢查與 PENDING 清理）
  - Resume 前驗證上游產出完整性（universe_snapshot/factor_scores/valuations/rankings 依階段要求），缺資料拒絕續跑
  - 每階段執行後寫入 stage log；PipelineResult 新增 stage_status / resumed 欄位
- `build_stage_handlers(resume_snapshot_id=...)`：預先綁定既有 snapshot_id，resume 不另建新 draft
- CLI：`twquant daily --resume <snapshot_id>` 及 `--resume-from <stage>`（強制從指定階段重跑）
- 冪等性：handlers 本身以 upsert / conflict-do-nothing 寫入；resume 重跑不產生重複 snapshot
- 測試：`tests/unit/test_pipeline_resume.py` 14 例（FakeConn mock DB）：續跑剩餘階段、全部完成短路、找不到 snapshot 拒絕、上游不完整拒絕、resume-from 強制起始、失敗記 FAILED、CLI 參數解析
- 品質閘門：ruff 通過、pytest unit 全綠（644 passed）、CLI help 實測正常
