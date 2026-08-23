---
github_issue: 
title: API key 即時刷新（免重啟生效）
type: feature
priority: high
status: done
depends_on: ["T101"]
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-23
updated: 2026-08-23
---

# T102 - API key 即時刷新（nokey 模型復活）

## 目標
存 key 後只寫入設定檔，registry 與 ping engine 手上的模型副本仍是空 key，
導致模型停在 `nokey`、主畫面看不到、也無法測試。讓 key 異動即時傳播。

## 驗收標準
- [x] SettingsScreen 新增 SetOnChange 回呼，存/刪 key 時觸發
- [x] Model.RefreshAPIKeys()：重新解析所有模型的 APIKey、將 nokey 重置為 pending、以新 snapshot 更新 engine 並 BumpEpoch
- [x] Wizard 完成後同樣呼叫 RefreshAPIKeys
- [x] Engine 新增唯讀 Model(id) accessor 供驗證
- [x] TestRefreshAPIKeysRevivesNoKeyModels / TestSettingsOnChangeCallback 通過

## 備註
commit 0731a23。
