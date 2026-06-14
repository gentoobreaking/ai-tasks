---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/454
type: Feature
priority: high
status: pending
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-14
updated: 2026-05-14
---

## 原因
PBRMaterialManager.swift 存在但未與渲染器整合，也未從 NNR 模型載入實際材質。需要等 NNR 模型就緒。

# T33 - PBR 材質系統

## 目標
實現基於物理的渲染材質

## 驗收標準
- [ ] 實現 PBR 著色器
- [ ] 支援 Albedo/Normal/Roughness/Metallic
- [ ] 實現環境光遮蔽

## AI 可執行命令
```swift
// PBR 參數
let material = PBRMaterial(albedo: albedoTex, normal: normalTex, roughness: 0.5)
```

## 交付物
產出：`~/Projects/TaoLive-iOS/TaoLive/PBRMaterial.swift`
