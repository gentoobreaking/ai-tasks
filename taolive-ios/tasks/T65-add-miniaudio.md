---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/481
title: 下載並將遺失的 miniaudio 程式庫加入專案
type: Feature
priority: high
status: pending
assignee: claw
created: 2026-05-14
updated: 2026-05-14
howto: 從 miniaudio GitHub 下載單一標頭檔，放入 CppEngine/3rd_party/miniaudio/，並更新 HEADER_SEARCH_PATHS。
---

# T65 - 下載並將遺失的 miniaudio 程式庫加入專案

## 目標
`a2bs_utils.cpp` 依賴 `<miniaudio/miniaudio.h>`，但專案內缺少該程式庫。需要下載並加入。

## 驗收標準
- [ ] miniaudio.h 加入 `CppEngine/3rd_party/miniaudio/`
- [ ] `project.yml` 的 `HEADER_SEARCH_PATHS` 包含該路徑
- [ ] `a2bs_utils.cpp` 可成功編譯

## 實作紀錄

### 問題
`a2bs_utils.cpp` 在 `MINIAUDIO_IMPLEMENTATION` 模式下編譯 miniaudio.h，iOS 平台的實作部分會 `#include <AVFoundation/AVFoundation.h>`，而 AVFoundation 會引入 ObjC 標頭（`NSObjCRuntime.h` 等），導致 C++ 編譯器報錯 `unknown type name 'NSString'`。

錯誤發生在 iOS Simulator **與** iOS Device 兩種建構中，因為 miniaudio 使用 `TARGET_OS_IPHONE` 判斷平台（非 desktop Apple），透過 `#include <AVFoundation/AVFoundation.h>` 取得 iOS 音訊裝置後端支援。

### 解法
在 `a2bs_utils.cpp` 的 miniaudio include 前加入：
```cpp
#define MA_NO_COREAUDIO /* 不使用 CoreAudio 後端，只使用 resampler */
```

`MA_NO_COREAUDIO` 阻止 `MA_HAS_COREAUDIO` 被定義，整個 CoreAudio 後端段落（含 AVFoundation include）被條件編譯跳過。miniaudio 的 `ma_resampler_*` 函數屬於核心功能，不依賴 `MA_HAS_COREAUDIO`，不影響 audio resampling。

### 其他調整
- 關閉 `SUPPORTS_MACCATALYST`（原設 `YES`），因 XCFramework 無 maccatalyst slice，會導致編譯錯誤。TaoLive 主要目標為 iOS，不需要 Catalyst 支援。
- 關閉 Catalyst 後，scheme 的目標平台恢復正常，`-destination "platform=iOS Simulator,name=iPhone 17"` 可直接使用。

### 驗證
```bash
# Simulator arm64
xcodebuild -target TaoLive -sdk iphonesimulator -arch arm64 ... build  → ✅ BUILD SUCCEEDED
# Device arm64
xcodebuild -target TaoLive -sdk iphoneos ... build                     → ✅ BUILD SUCCEEDED
# Simulator by device name
xcodebuild -scheme TaoLive -destination "platform=iOS Simulator,name=iPhone 17" ... build → ✅ BUILD SUCCEEDED
```