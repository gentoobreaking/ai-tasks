---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/744
title: T009-Vision-Language模組整合
type: Feature
priority: high
status: done
assignee: 寶寶
created: 2026-05-13
updated: 2026-05-13
depends: T002, T008
howto: 
---

# T009 - Vision-Language 模組整合

## Description

目前使用的 Qwen3.5-0.8B-MNN 是 Vision-Language 模型（is_visual: true），但缺少 visual.mnn 檔案導致 C++ 印 warning。

## Acceptance Criteria

- [ ] 下載 `visual.mnn` + `visual.mnn.weight` 檔案
- [ ] 確認 C++ warning 消失
- [ ] 測試圖片輸入：上傳圖片，模型能描述內容
- [ ] 前端上傳圖片功能整合（T005 前端完成後）

## Current State

```
[Error]: Can't open file:/Users/.../visual.mnn
```

## Notes

- 圖片支援是 JARVIS 的核心功能（T005 前端 + T009 VL 整合）
- 優先順序 P2（做完 T008 回應加速再做）
