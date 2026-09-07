---
github_issue: N/A
title: Evidence-based classification 落實 spec §4.4
type: refactor
priority: medium
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T108]
updated: 2026-09-07
---

# T109 - Evidence-based classification 落實 spec §4.4

## 目標

讓 `Classifier` 為每個 classification 決策記錄具代表性、可審計的 evidence 樣本（spec §4.4 與 §39），而非只記「哪條 rule 命中」。

現況問題：現有 `Classify` 確實有收集 evidence（`classifier.go:25` `var evidence []models.ClassificationEvidence`），但只記 rule name 而非 source code 片段、檔案路徑、套件名等。spec §39 要求 evidence 含 `type: SOURCE_CODE / PACKAGE / RUNTIME`、`file`、`signal` 三欄位。

阻塞：
- spec §4.4「Classification MUST be based on evidence」
- spec §39「Source Evidence」結構化記錄
- spec §64 DoD「False-positive acceptance tests pass」需要可審計的 evidence 才能解釋為何某 entity 被分類為 X

## 問題根因

`internal/engines/classifier.go` 的各 `isXxx` 方法（isMCPServer / isMCPClient / isDataLibrary 等）evidence 收集只 append rule name：

```go
evidence = append(evidence, models.ClassificationEvidence{
    Type:   "rule_match",
    Rule:   "has_mcp_server_classes",
    Signal: "McpServer",
})
```

缺 `File` 欄位（哪個 source file 命中的）、缺 `Snippet`（實際 source code 片段）、缺 `Confidence` per evidence。

`internal/evidence/collector.go` 已有 `Collector` 結構，但沒被 classifier 使用。

## 修法

### A. 擴充 `ClassificationEvidence` struct

`internal/models/classification.go`：

```go
type ClassificationEvidence struct {
    Type       string  `json:"type"`        // SOURCE_CODE | PACKAGE_MANIFEST | README | ENTRYPOINT | RUNTIME | RULE_MATCH
    File       string  `json:"file,omitempty"`     // e.g. "src/server.ts" or "package.json"
    Signal     string  `json:"signal"`            // e.g. "McpServer class instantiation"
    Snippet    string  `json:"snippet,omitempty"` // optional actual code excerpt (max 200 chars)
    Confidence float64 `json:"confidence"`        // per-evidence confidence 0–1
    Source     string  `json:"source,omitempty"`  // e.g. "github_file_list" or "llm_fallback"
    Location   string  `json:"location,omitempty"` // e.g. "src/server.ts:42"
    Timestamp  RFC3339Time `json:"timestamp"`
}
```

### B. `evidence.Collector` 提供結構化 API

`internal/evidence/collector.go` 加 helper：

```go
// AddSourceCode records source code evidence (spec §39).
func (c *Collector) AddSourceCode(file, signal, snippet string, confidence float64) {
    c.evidences = append(c.evidences, models.ClassificationEvidence{
        Type:       "SOURCE_CODE",
        File:       file,
        Signal:     signal,
        Snippet:    truncate(snippet, 200),
        Confidence: confidence,
        Timestamp:  models.RFC3339Time(time.Now().UTC()),
    })
}

func (c *Collector) AddPackageManifest(file, signal string, confidence float64) { ... }
func (c *Collector) AddReadme(signal, snippet string, confidence float64) { ... }
func (c *Collector) AddRuntime(signal string, confidence float64) { ... }
func (c *Collector) AddRuleMatch(rule, signal string, confidence float64) { ... }

func (c *Collector) All() []models.ClassificationEvidence { return c.evidences }
```

### C. Classifier 用 Collector

`internal/engines/classifier.go` 的 `isMCPServer` 等方法改：

```go
func (c *Classifier) isMCPServer(entity *models.Entity, col *evidence.Collector, reasoning *[]string) bool {
    // 找 source file 清單（從 entity.RawContent 或額外 metadata）
    for _, file := range entity.Repository.PackageFiles {
        if strings.HasSuffix(file, ".ts") || strings.HasSuffix(file, ".js") {
            content := readFile(entity, file)  // 從 RawContent 解析或 cache
            if matches.McpServerClass(content) {
                col.AddSourceCode(file, "McpServer class", extractSnippet(content, "McpServer"), 0.95)
                *reasoning = append(*reasoning, fmt.Sprintf("MCP server class found in %s", file))
                return true
            }
        }
    }
    col.AddRuleMatch("has_mcp_server_classes", "searched but not found", 0.0)
    return false
}
```

**注意**：`entity.RawContent` 目前是單一字串（`entity.go:525`）。若要支援多檔案搜尋，需先：
1. 在 normalization 階段把每個關鍵檔案（package.json / pyproject.toml / src/index.ts 等）的內容分開存
2. 或在 `Entity.Files map[string]string` 加一個欄位（T104 已加 `SourceReference.Primary`，可順手加 `Entity.Files`）

簡化方案：先用 `RawContent` 全文搜尋，evidence `File` 留空或填「README」；等 T111 之後再升級到 per-file。

### D. Confidence per evidence

每個 evidence 自帶 confidence，classifier 最終 confidence 是 evidence confidences 的加權平均（不只是 binary rule match）。

```go
func computeConfidence(evidences []models.ClassificationEvidence) float64 {
    if len(evidences) == 0 { return 0 }
    sum, weight := 0.0, 0.0
    for _, e := range evidences {
        w := 1.0
        switch e.Type {
        case "SOURCE_CODE": w = 3.0  // source code 權重最高
        case "RUNTIME": w = 5.0     // runtime 權重最高
        case "PACKAGE_MANIFEST": w = 2.0
        case "README": w = 1.0
        case "RULE_MATCH": w = 0.5
        }
        sum += e.Confidence * w
        weight += w
    }
    return sum / weight
}
```

## 驗收標準

- [ ] `ClassificationEvidence` struct 擴充 `File`、`Snippet`、`Confidence` 欄位
- [ ] `evidence.Collector` 加 `AddSourceCode` / `AddPackageManifest` / `AddReadme` / `AddRuntime` / `AddRuleMatch` helper
- [ ] `Classifier.isXxx` 方法改用 Collector 收集 evidence
- [ ] `computeConfidence` 函式加上
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/engines/... ./internal/evidence/... -v -count=1` 通過
- [ ] 新增 unit test：
  - `TestEvidence_CollectorTypes` 確認 5 種 evidence type 都能加
  - `TestEvidence_ConfidenceWeighting` 確認 source code vs rule_match 權重差異
  - `TestClassifier_EvidencePerDecision` 確認 `Classify` 回傳的 result.Evidence 至少 1 個 SOURCE_CODE 或 PACKAGE_MANIFEST 類型
- [ ] 既有的 `acceptance_test.go` 14 個 test 仍通過（spec §56 Test 1-12 的 evidence 結構可能變動要 update assertion）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097、T108（LLM fallback 接收更結構化的 evidence 才有意義）
- 對應 spec §4.4、§39、§64 DoD「False-positive acceptance tests pass」
- 風險：擴充 `ClassificationEvidence` 是向後不相容變更，DB 已存的 entity 沒 `Snippet` 欄位時反序列化為空字串（相容）
- 預期效益：可審計的 evidence 讓 FP rate 量測（T107）能區分「rule 邏輯誤判」vs「evidence 不足」，方便精準改善
- 與 T110（§27 證據加權）互補：T109 提供 evidence 結構，T110 提供 evidence → MCP identity confidence 的加權規則
- 相關任務：T097、T108、T110
