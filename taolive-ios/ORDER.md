# TaoLive-iOS 任務執行順序

## 專案目標
將 MNN TaoAvatar（Android 數位人）移植到 iOS，實現本地即時數位人。

## 專案路徑
~/Projects/TaoLive-iOS/

## 階段 0：研究（先行，可並行）

### T01 - 下載並分析 TaoAvatar Android 原始碼
```bash
cd ~/Projects
git clone https://github.com/alibaba/MNN.git --depth 1
find ~/Projects/MNN/apps/Android/MnnTaoAvatar -type f \( -name "*.java" -o -name "*.cpp" \)
```
**驗收：** 列出所有關鍵檔案及用途

### T02 - 識別所有 MNN 模型檔案
```bash
find ~/Projects/MNN/apps/Android/MnnTaoAvatar -name "*.mnn" -exec ls -lh {} \;
```
**驗收：** 模型清單表格

### T03 - 分析音訊處理流程
```bash
grep -r "AudioRecord" ~/Projects/MNN/apps/Android/MnnTaoAvatar/src --include="*.java" -l
```
**驗收：** 音訊流程圖

### T04 - 分析動作選擇邏輯
```bash
grep -r "action\|motion" ~/Projects/MNN/apps/Android/MnnTaoAvatar/src --include="*.java" -l
```
**驗收：** 動作選擇器邏輯

### T05 - 分析 NNR 渲染管線
```bash
grep -r "render\|draw" ~/Projects/MNN/apps/Android/MnnTaoAvatar/src --include="*.java" -l
```
**驗收：** 渲染架構說明

### T06 - 評估可移植性
**驗收：** 移植策略文件

### T07 - 撰寫架構評估報告
**驗收：** 完整評估文件

## 階段 1：環境建置（可並行）

### T10 - Apple Developer 帳號
**驗收：** 登入 Developer Portal

### T11 - 建立 Xcode 專案
```bash
mkdir -p ~/Projects/TaoLive-iOS
cd ~/Projects/TaoLive-iOS
xcodegen create-project --name TaoLive --platform ios --bundle-id com.taolive.ios
```
**驗收：** Xcode 專案可開啟

### T12 - 設定 MNN iOS 環境
**驗收：** MNN 可引用

### T13 - 驗證 MNN 載入
**驗收：** MNN 模型可載入

### T14 - 設定 AVFoundation 音訊
**驗收：** 麥克風錄製正常

### T15 - 建立建構腳本
**驗收：** make 可編譯

## 階段 2：核心移植

### T20 - 移植音訊錄製
**驗收：** PCM 輸出

### T21 - 整合 sherpa-mnn
**驗收：** Whisper iOS 運作

### T22 - 建立音訊串流
**驗收：** 麥克風→文字

### T23 - 整合 TTS
**驗收：** 文字→語音

### T25 - 收集動作檔案
**驗收：** 動作清單

### T26 - 動作庫管理
**驗收：** 可載入動作

### T27 - 動作選擇器
**驗收：** 選擇正常

### T28 - Blendshape 產生器
**驗收：** 表情輸出

### T30 - 選擇渲染方案
**驗收：** 選擇並說明

### T31 - 基本渲染框架
**驗收：** 3D 顯示

### T32 - 整合 Blendshape
**驗收：** 表情變化

### T33 - 整合身體動作
**驗收：** 動作播放

## 階段 3：整合與 UI

### T40 - 設計 UI
### T41 - 攝影機預覽
### T42 - 整合音訊到 UI
### T43 - 整合渲染到 UI
### T44 - 設定頁面

## 階段 4：測試與優化

### T50 - 單元測試
### T51 - 整合測試
### T52 - 記憶體優化 < 500MB
### T53 - 延遲優化 < 2s
### T54 - 功耗優化
### T55 - Beta 發布

## 階段 5：驗收發布

### T60 - 使用文件
### T61 - 開發文件
### T62 - Code Review
### T63 - App Store 發布

## 驗收標準

### 功能
- [ ] 麥克風收音
- [ ] ASR 辨識
- [ ] LLM 回應
- [ ] TTS 發聲
- [ ] 臉部表情
- [ ] 身體動作
- [ ] 同步 < 100ms
- [ ] 錄製輸出

### 效能
- [ ] 記憶體 < 500MB
- [ ] 載入 < 5s
- [ ] 延遲 < 2s
- [ ] 30fps+
- [ ] 30分鐘不崩

### 平台
- [ ] iPhone 12+
- [ ] iPad 支援
- [ ] App Store 上架

## Review 檢查點

### 每週
- 進度/阻礙

### 每階段後
- 目標/質量

### 最終
- 所有標準/文件完整