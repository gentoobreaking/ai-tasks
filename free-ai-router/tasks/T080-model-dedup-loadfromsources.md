---
github_issue:
title: Add model deduplication in LoadFromSources
type: bugfix
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T080 - Add model deduplication in LoadFromSources

## 目標
在 `registry.LoadFromSources()` 中加入 model ID 去重邏輯，防止多個 provider 定義相同 model ID 時產生重複條目。

## 背景
`LoadFromSources()` 直接將 `Manager.GetAllModels()` 的每個 model entry 轉換為 `Model` 並加入 registry：

```go
func (r *Registry) LoadFromSources(mgr *providers.Manager) {
    models := mgr.GetAllModels()
    var result []*Model
    for _, m := range models {
        result = append(result, &Model{ID: m.ID, ...})
    }
    r.ReplaceAll(result)
}
```

如果兩個 provider 定義了相同的 model ID（例如 `sources.json` 中 nvidia 定義了某模型，而 `AutoDiscoverModels` 又從 `/v1/models` 回傳了同一模型），會產生重複條目。`ReplaceAll` 使用 `map[string]*Model`（key = model ID），所以**最後寫入的會覆蓋前面的**，不會 crash，但可能導致預期外的 provider 資訊被覆蓋。

## 驗收標準
- [x] `LoadFromSources()` 檢查 model ID 是否已存在，若已存在則合併或跳過
- [x] 合併策略：保留第一個 provider 的資訊，後續重複的只更新標籤/context（如果更詳細）
- [x] 加入 debug log "skipping duplicate model {id} from {provider} (already loaded)"
- [x] `go build ./...` 通過
- [x] `go test ./...` 全部通過

## 修改位置

**檔案：** `internal/models/catalog.go`

```go
func (r *Registry) LoadFromSources(mgr *providers.Manager) {
    models := mgr.GetAllModels()
    seen := make(map[string]bool)
    var result []*Model
    for _, m := range models {
        if seen[m.ID] {
            continue // skip duplicate
        }
        seen[m.ID] = true
        // ...
    }
    r.ReplaceAll(result)
}
```

## 備註
- 優先級 low — 目前因 `ReplaceAll` 使用 map，重複 model 會被覆蓋而非 crash
- 但未來若改用 slice-based registry 就可能變成真正 bug
- 這個 fix 也讓 T071（discovery logging）能準確報告 "X models, Y unique"
