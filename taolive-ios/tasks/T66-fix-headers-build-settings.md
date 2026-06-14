---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/482
title: 修正標頭檔路徑並清理重複編譯設定
type: Feature
priority: high
status: pending
assignee: claw
created: 2026-05-14
updated: 2026-05-14
howto: 在 project.yml 中加入 CppEngine/include/a2bs 與 CppEngine/include/MNN 到 HEADER_SEARCH_PATHS，移除重複的 CLANG_ENABLE_MODULES，將所有 A2BS .cpp 加入 sources。
---

# T66 - 修正標頭檔路徑並清理重複編譯設定

## 目標
修正 `project.yml` 中的建構設定，確保所有標頭檔路徑正確，並移除重複的編譯選項。

## 驗收標準
- [ ] `HEADER_SEARCH_PATHS` 包含 `CppEngine/include/a2bs` 和 `CppEngine/include/MNN`
- [ ] 重複的 `CLANG_ENABLE_MODULES: YES` 已移除
- [ ] `OTHER_LDFLAGS` 已修正為 `$(inherited) -ObjC`（或至少不破壞繼承的 flags）
- [ ] 所有 A2BS .cpp 已加入 `sources`

## 實作紀錄

### 分析
對照 `project.yml` 與 `CppEngine/` 目錄結構，確認 HEADER_SEARCH_PATHS 覆蓋了所有目錄：
- `CppEngine/include/a2bs` — ✅ 已有
- `CppEngine/include/MNN` — ⏭️ 已不存在（git 刪除的舊 headers，由 XCFramework 取代）
- `CppEngine/common`、`CppEngine/3rd_party`、`CppEngine/3rd_party/miniaudio` — ✅ 已有
- `OTHER_LDFLAGS` — 原版寫死 `-ObjC`，覆蓋了預設值，修正為 `$(inherited) -ObjC`
- `CLANG_ENABLE_MODULES: YES` — 原版出現兩次，重複項已移除
- sources 列出 CppEngine/a2bs/ 下 6 個 .cpp，已全量覆蓋

### 關鍵發現
- T67 的 project.yml 改動（切換到 XCFramework）已同時順便修正了 T66 的設定
- `CppEngine/include/MNN` 目錄已不存在（舊 MNN headers 被 git 刪除），MNN headers 現在統一由 XCFramework 的 `MNN.xcframework/ios-arm64/MNN.framework/Headers` 提供

### 驗證
```bash
xcodegen generate --spec project.yml --project .
xcodebuild -project TaoLive.xcodeproj -target TaoLive -sdk iphonesimulator \
  -configuration Debug ARCHS="arm64" ONLY_ACTIVE_ARCH=YES \
  CODE_SIGNING_ALLOWED=NO build
```
Build 無新增錯誤，唯一 failure 是 pre-existing 的 `a2bs_utils.cpp` Foundation header 問題（T65 範疇）。