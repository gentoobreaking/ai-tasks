---
github_issue: N/A
title: Classifier 接入 LLM fallback 主流程
type: feature
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T107]
updated: 2026-09-07
---

# T108 - Classifier 接入 LLM fallback 主流程

## 目標

把 `internal/engines/llm_classifier.go` 已實作的 `LLMClassifierFallback.ClassifyWithLLM` 接到 `Classifier.Classify` 主流程，讓 ambiguous cases（rule confidence < 0.7 或 Taiwan/AI score 在中間帶）自動觸發 LLM 補強。

現況問題：LLM fallback **程式碼完整**（`llm_classifier.go:127` `ClassifyWithLLM`），integration test 也寫了（`llm_classifier_integration_test.go` 12 個 case），但 `Classifier.Classify`（`classifier.go:24`）是純 rule-based，**完全沒呼叫 LLM**。預期 T107 量測的 FP rate 會在 10–20%，需 LLM fallback 補刀才可能達 spec §58 < 5% 目標。

阻塞：
- spec §58 KPI（FP rate < 5%）
- spec §64 DoD #21「MCP false-positive rate is below 5%」
- spec §73 acceptance test（已有 LLM fallback 測試但無 integration）

## 問題根因

`internal/engines/classifier.go:11-22`：

```go
type Classifier struct {
    signals *config.TaiwanSignals
}

func NewClassifier() *Classifier {
    return &Classifier{
        signals: config.DefaultTaiwanSignals(),
    }
}

func (c *Classifier) Classify(entity *models.Entity) models.ClassificationResult {
    // 完全 keyword-based，無 LLM 介入
}
```

`LLMClassifierFallback` 是獨立 struct（`llm_classifier.go:37`），需要 `LLMClassifierFallbackConfig` 才能建構（API URL、model chain、timeout 等），而 `NewClassifier` 沒接 config。

## 修法

### A. Classifier 加 LLM fallback 選項

```go
type Classifier struct {
    signals     *config.TaiwanSignals
    llmFallback *LLMClassifierFallback  // NEW: 可為 nil（pure rule-based）
}

type ClassifierOption func(*Classifier)

func WithLLMFallback(fb *LLMClassifierFallback) ClassifierOption {
    return func(c *Classifier) { c.llmFallback = fb }
}

func NewClassifier(opts ...ClassifierOption) *Classifier {
    c := &Classifier{
        signals: config.DefaultTaiwanSignals(),
    }
    for _, opt := range opts {
        opt(c)
    }
    return c
}
```

### B. Classify 加 LLM 觸發邏輯

`Classify` 結尾，原本是「rule 沒命中 → Unknown」，改為「rule confidence 低或 trigger 條件滿足 → 呼叫 LLM fallback」。

```go
func (c *Classifier) Classify(ctx context.Context, entity *models.Entity) models.ClassificationResult {
    ruleResult := c.classifyByRules(entity)

    // Trigger LLM fallback if conditions met (T108)
    if c.llmFallback != nil && ShouldTriggerLLM(ruleResult, entity.TaiwanRelevance.Score, entity.AIRelevance.Score) {
        llmResult := c.llmFallback.ClassifyWithLLM(ctx, entity, ruleResult)
        // Merge evidence: ruleResult evidence + llmResult evidence
        llmResult.Evidence = append(llmResult.Evidence, ruleResult.Evidence...)
        llmResult.Reasoning = append([]string{
            "[LLM fallback triggered]",
            fmt.Sprintf("rule confidence %.2f below threshold", ruleResult.Confidence),
        }, llmResult.Reasoning...)
        return llmResult
    }
    return ruleResult
}

func (c *Classifier) classifyByRules(entity *models.Entity) models.ClassificationResult {
    // 原本 Classify 的內容（不需 ctx）
}
```

**注意**：`Classify` 簽章從 `func (c *Classifier) Classify(entity *models.Entity)` 改為 `func (c *Classifier) Classify(ctx context.Context, entity *models.Entity)` — 需更新所有呼叫端（coordinator 與 tests）。

### C. Trigger 條件（沿用既有）

`ShouldTriggerLLM`（`llm_classifier.go:97-101`）已實作：

```go
func ShouldTriggerLLM(ruleResult models.ClassificationResult, taiwanScore, aiScore float64) bool {
    if ruleResult.Confidence < 0.7 {
        return true
    }
    // ... 其他條件
}
```

T108 不改 trigger 規則，沿用既有邏輯。

### D. coordinator 串接

`internal/coordinator/coordinator.go:421` 附近的 `runClassifier` 改：

```go
pc.runClassifier(ctx, crawlID, entities)
```

→ 確認呼叫有傳 ctx。

### E. CLI flag + env

`cmd/crawler/main.go` 加全域 flag：

```go
rootCmd.PersistentFlags().BoolVar(&enableLLMClassifier, "enable-llm-classifier", true,
    "use LLM fallback for ambiguous classification (default: true, spec §58)")
```

`setupCrawler` 內 `engines.NewClassifier()` 改為：

```go
classifier := engines.NewClassifier()
if enableLLMClassifier && os.Getenv("OPENAI_API_KEY") != "" {
    fb := engines.NewLLMClassifierFallback(&engines.LLMClassifierFallbackConfig{
        BaseURL:    os.Getenv("OPENAI_BASE_URL"),
        APIKey:     os.Getenv("OPENAI_API_KEY"),
        Model:      os.Getenv("OPENAI_MODEL"),
        Timeout:    30 * time.Second,
    })
    classifier = engines.NewClassifier(engines.WithLLMFallback(fb))
}
pc := coordinator.New(... classifier ...)
```

`docker-compose.yaml` crawler 環境已有 `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`，剛好可串。

### F. tests 更新

既有 `internal/engines/acceptance_test.go` 14 個 test 改呼叫：

```go
result := classifier.Classify(ctx, entity)
```

`fp_rate_test.go:135` 同樣。

新增 integration test：

```go
func TestClassifier_TriggersLLMForAmbiguous(t *testing.T) {
    // mock HTTP server 模擬 LLM 回應
    // 給 entity rule confidence < 0.7
    // 確認 classifier.Classify 回傳 LLM 結果（Reasoning 含 "[LLM fallback triggered]"）
}
```

## 驗收標準

- [ ] `Classifier` struct 加 `llmFallback` 欄位與 `WithLLMFallback` option
- [ ] `Classify` 簽章加 `ctx` 參數
- [ ] `Classify` 結尾加 LLM trigger 邏輯
- [ ] `internal/engines/llm_classifier.go` 不需改（沿用）
- [ ] coordinator 呼叫 `Classify` 傳 ctx
- [ ] CLI flag `--enable-llm-classifier` 加
- [ ] `setupCrawler` 從 `OPENAI_API_KEY` 環境變數建 LLM fallback
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/engines/... -v -count=1` 通過（含既有 14 acceptance + 12 LLM integration + 新增 1 個 integration）
- [ ] 跑 `crawler run` 有 `OPENAI_API_KEY` 時 log 顯示 LLM 觸發次數
- [ ] 跑 `crawler run` 無 `OPENAI_API_KEY` 時跳過 LLM（用 `WithLLMFallback(nil)`），不 crash

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097、T107（T107 跑完才知道是否需要 LLM fallback；但 T108 是「先備好 LLM fallback，T107 量測後視需要重跑」）
- 對應 spec §58 KPI、§64 DoD #21
- 風險：`Classify` 簽章改加 `ctx` 會 break 所有測試與 coordinator，要批次更新
- LLM 觸發會大幅增加 crawler 執行時間（每個 ambiguous case 多 1-3 秒 LLM 呼叫）— 預設 trigger 條件只看 confidence < 0.7，應只覆蓋少數 entity（5–15%）
- 預期效益：把現有 ~15% FP rate 降到 ~5–8%（LLM 對 tutorial / data library 識別較準）
- 若仍達不到 < 5%，需 follow-up：T109（evidence-based）+ T110（spec §27 證據加權）+ T111（Data Library 防誤判）
- 相關任務：T097、T107、T109、T110、T111
