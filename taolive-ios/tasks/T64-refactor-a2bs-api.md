---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/480
title: 重構 A2BS 原始碼以適應新版 MNN API
type: Feature
priority: high
status: pending
assignee: claw
created: 2026-05-14
updated: 2026-05-14
howto: 分析新版 MNN API（BackendConfig → Backend::Config, RuntimeManager → Executor::RuntimeManager 等變更），重構 CppEngine/a2bs/ 下的 gs_body_converter.cpp 與 audio_to_flame_blend_shape.cpp 使其與 Frameworks/MNN.framework 的 API 相容。
---

# T64 - 重構 A2BS 原始碼以適應新版 MNN API

## 目標
將 `CppEngine/a2bs/` 中與 MNN API 不相容的程式碼重構，使其能與 `Frameworks/MNN.framework` 連結。

## 驗收標準
- [ ] `gs_body_converter.cpp` 可成功編譯
- [ ] `audio_to_flame_blend_shape.cpp` 可成功編譯
- [ ] 所有 C++ 檔案可成功連結

## 實作紀錄

實際檢查 MNN 3.5.0 headers 與現有 A2BS 原始碼後發現：

### API 對照（無重大變更）
- `BackendConfig` 仍在 `MNNForwardType.h`（namespace `MNN`），未遷移至 `Backend::Config`
- `Executor::newExecutor(MNNForwardType, const BackendConfig&, int)` 仍然存在
- `Executor::RuntimeManager::createRuntimeManager(ScheduleConfig)` 仍然存在
- `Module::load(inputs, outputs, path, rtmgr, config)` 仍然存在

### 已存在的變更（Auto-sync commits）
git diff 顯示先前的 Auto-sync 已包含：
1. 補上 `MNN::` namespace prefix（`BackendConfig` → `MNN::BackendConfig`，`Precision_High` → `MNN::BackendConfig::Precision_High`）
2. `createRuntimeManager`/`destroy` 拆分為兩步（`auto* rawRtmgr` + `shared_ptr(rawRtmgr, destroy)`）
3. `MNN_ERROR` → `MH_ERROR`
4. `gs_body_converter.cpp` 中 `rtmgr` → `rtmgr_`（member access 修正）

### 驗證
```bash
xcodebuild -target TaoLive -sdk iphoneos ... build → ✅ BUILD SUCCEEDED
xcodebuild -target TaoLive -sdk iphonesimulator ... build → ✅ BUILD SUCCEEDED
```

**結論：T64 已在先前的 commits 中完成，無需額外變更。**