---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/483
title: 調整 Excluded Architectures 設定以相容模擬器
type: Feature
priority: high
status: pending
assignee: claw
created: 2026-05-14
updated: 2026-05-14
howto: 在 project.yml 中加入 EXCLUDED_ARCHS[sdk=iphonesimulator*] 設定，確保 simulator 建構時排除不相容架構。同時確認 MNN.framework 的架構與目標平台匹配。
---

# T67 - 調整 Excluded Architectures 設定以相容模擬器

## 目標
調整專案建構設定，使 iOS Simulator 建構時能正確連結 MNN.framework。

## 驗收標準
- [ ] `EXCLUDED_ARCHS` 已設定（如有必要）
- [ ] iOS Simulator 建構不再出現 `building for 'iOS-simulator' but linking object built for 'iOS'` 錯誤
- [ ] `make DESTINATION="platform=iOS Simulator,name=iPhone 17" build` 可成功編譯

## 實作紀錄

### 分析
既有 MNN.framework 只含 iOS device arm64 slice（`LC_VERSION_MIN_IPHONEOS`），無 simulator slice。用 `lipo -info` / `otool -l` 確認。

### 第一版：EXCLUDED_ARCHS（已捨棄）
```yaml
EXCLUDED_ARCHS[sdk=iphonesimulator*]: arm64
```
讓模擬器退到 `x86_64` 跑，透過 Rosetta 2 執行。開發堪用但效能較差。

### 第二版（最終方案）：XCFramework
Apple Silicon 需要 simulator arm64，但 **`lipo -create` 不允許相同 arch 的多平台 fat binary**（arm64 + arm64 無法合併）。Apple 官方解法是 **XCFramework**。

**建構步驟：**
```bash
# 1. 編譯 device arm64（iOS）
cmake /path/to/MNN \
  -DCMAKE_TOOLCHAIN_FILE=cmake/ios.toolchain.cmake \
  -DMNN_METAL=ON -DARCHS="arm64" -DMNN_AAPL_FMWK=1 -DMNN_BUILD_SHARED_LIBS=false
make MNN -j$(sysctl -n hw.logicalcpu)

# 2. 編譯 simulator arm64
# SIMULATOR64 預設 arch=x86_64，但可透過 -DARCHS="arm64" 覆蓋
cmake /path/to/MNN \
  -DCMAKE_TOOLCHAIN_FILE=cmake/ios.toolchain.cmake \
  -DMNN_METAL=OFF -DARCHS="arm64" -DPLATFORM=SIMULATOR64 \
  -DMNN_AAPL_FMWK=1 -DMNN_BUILD_SHARED_LIBS=false \
  -DCMAKE_HAVE_LIBC_PTHREAD=1  # 防止 cmake 測試 hang
make MNN -j$(sysctl -n hw.logicalcpu)

# 3. 打包 XCFramework
xcodebuild -create-xcframework \
  -framework device/MNN.framework \
  -framework simulator/MNN.framework \
  -output MNN.xcframework
```

**驗證：**
```bash
# XCFramework 結構
MNN.xcframework/
├── ios-arm64/                   ← 真機 (arm64, LC_VERSION_MIN_IPHONEOS)
│   └── MNN.framework
└── ios-arm64-simulator/         ← 模擬器 (arm64, LC_BUILD_VERSION platform=7)
    └── MNN.framework
```

### 關鍵發現
1. `lipo -create` 無法合併相同 arch 但不同平台的 slice（arm64+iOS vs arm64+Simulator）
2. Xcode 12+ 的 XCFramework 為此設計，xcodegen 直接支援 `dependencies: - framework: path.xcframework`
3. cmake ios.toolchain.cmake 的 `SIMULATOR64` 支援 `-DARCHS="arm64"` 覆寫
4. cmake configure 中 `Performing Test CMAKE_HAVE_LIBC_PTHREAD` 在 simulator 配置可能 hang，加 `-DCMAKE_HAVE_LIBC_PTHREAD=1` 跳過
5. `project.yml` 的 `HEADER_SEARCH_PATHS` 需指向 XCFramework 內的真機 headers path

### 磁碟空間
- MNN 原始碼: 342MB（保留以供後續更新）
- MNN 建構中間產物: ~210MB（可清除）
- MNN.xcframework 最終體積: 14MB