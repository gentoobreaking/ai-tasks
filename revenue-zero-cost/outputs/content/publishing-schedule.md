# 內容發布排程系統

> 自動化內容產出與發布的標準化流程

---

## 一、內容日曆（2026 Q2-Q3）

> 目標：每週至少 2 篇內容露出，維持社群能見度

### 發布節奏

| 週次 | 日期範圍 | 發布內容 | 平台 |
|------|----------|----------|------|
| W17 | 04/21-04/27 | GitHub README 更新 + 技術文章 01 | GitHub, Medium |
| W18 | 04/28-05/04 | 短筆記 × 2 | Twitter, Telegram |
| W19 | 05/05-05/11 | 技術文章 02 + 短筆記 × 1 | Medium, Twitter |
| W20 | 05/12-05/18 | 短筆記 × 2 | Twitter, Telegram |
| W21 | 05/19-05/25 | 技術文章 03（監控系統教程預告）+ 短筆記 × 1 | Medium, Twitter |
| W22 | 05/26-06/01 | 短筆記 × 2 | Twitter, Telegram |
| W23 | 06/02-06/08 | 付費教程 1 上架（ Gumroad）| Gumroad, Twitter |
| W24 | 06/09-06/15 | 短筆記 × 2 + 教程學生回饋 | Twitter, Telegram |
| W25 | 06/16-06/22 | 技術文章 04（Agent 協作經驗）+ 短筆記 × 1 | Medium, Twitter |
| W26 | 06/23-06/29 | 短筆記 × 2 | Twitter, Telegram |
| W27 | 06/30-07/06 | ClawHub 上架指南 + 短筆記 × 1 | Medium, Twitter |

### 內容庫存

| 狀態 | 標題 | 形式 | 字數 | 預計發布 |
|------|------|------|------|----------|
| ✅ 完成 | 零成本黃金監控系統 | 長文 | ~3500 | W17 |
| ✅ 完成 | OpenClaw 多 Agent 協作實戰 | 長文 | ~2500 | W19 |
| ✅ 完成 | 零成本打造監控系統教程 | 超長文 | ~6000 | W19 預告 → W21 |
| 🔄 編輯中 | 多 Agent 協作團隊設計經驗 | 長文 | ~3000 | W25 |
| 📋 規劃中 | ClawHub 上架完全指南 | 長文 | ~4000 | W27 |
| 📋 規劃中 | 技術選型決策思路 | 短文 | ~1500 | W28 |
| 📋 規劃中 | 自動化備份系統設計 | 長文 | ~3500 | Q3 |

---

## 二、內容模板

### 模板 1：短筆記（Twitter/X）

```
標題：[數字] 分鐘搞懂 [主題]

內容：
- 痛點描述（1-2 句）
- 核心技巧 / 結論（3 點以內）
- 結尾鈎子

範例：
三分鐘搞懂 OpenClaw Cron 設定

• Cron = 定時觸發 AI 任務
• 兩種模式：systemEvent（純指令）/ agentTurn（AI 推理）
• 實用範例：天氣提醒、黃金價格監控、每週報告

影片教程soon 👇

#OpenClaw #自動化
```

### 模板 2：技術長文（Medium）

```
標題：[吸睛標題：數字 + 動詞 + 結果]

副標題：[一句話說清楚這篇文解決什麼問題]

---

## 概述（200 字以內）
- 背景
- 這篇文解決什麼問題
- 讀完後學到什麼

## 準備工作
- 環境需求
- 前置技能

## 主体内容（分 3-5 個 Section）
### Section 1: [標題]
...

### Section 2: [標題]
...

## 常見問題（可選）

## 下一步

## 結語

---

## 相關資源
- GitHub: [連結]
- 範例專案: [連結]

💡 需要個人化定制？[填寫諮詢表單](inquiry-form.md)
```

### 模板 3：GitHub Release 公告

```
# [版本號] - [發布日期]

## 新增
- 功能 A：...
- 功能 B：...

## 修復
- 問題 #123：...

## 文檔
- 更新 README.md
- 新增 API 文件

---

_DOWNLOAD: [Release 頁面連結]_
```

### 模板 4：Telegram 每日/每週簡報

```
📌 [日期] 自動化筆記

【本週更新】
- 🔧 新功能：...
- 📝 文章：...
- 🐛 修復：...

【精選內容】
> 一句話摘要 + 連結

【下週預告】
- 內容 A
- 內容 B

【互動】
❓ 有問題？直接在這裡回覆
💬 想聊？歡迎加入 [社群連結]
```

---

## 三、發布檢查清單

> 每次發布前必讀，確保品質與一致性

### 一般檢查（所有內容）

- [☐] 標題吸睛、清楚表達價值
- [☐] 結尾有 CTA（諮詢表單連結）
- [☐] 連結已測試（無 404）
- [☐] 圖片已壓縮、Alt 文字有設定
- [☐] Hashtag 相關（最多 3-5 個）
- [☐] 預覽截圖正常顯示
- [☐] 語氣一致（非正式但專業）

### GitHub 發布額外檢查

- [☐] README.md 版本號更新
- [☐] CHANGELOG.md 已記錄
- [☐] Release 標籤已打（git tag）
- [☐] license 文件存在

### Medium 發布額外檢查

- [☐] canonical URL 設定（若同步發布）
- [☐] 標籤選擇正確（3-5 個）
- [☐] 封面圖片符合規範
- [☐] 閱讀時間合理（長文有分章節）

### Gumroad 發布額外檢查

- [☐] 價格與貨幣設定正確
- [☐] 試閱章節已設定
- [☐] 影片連結正確（嵌入而非下載）
- [☐] 客服 email 已設定
- [☐] 退換政策已聲明

---

## 四、自動化設定

### OpenClaw Cron 提醒（每週一 09:00）

```python
# 預設 payload（systemEvent）
# 發送本週發布提醒到 Telegram
```

| Cron | 觸發時間 | 動作 |
|------|----------|------|
| 每週一 09:00 | content-reminder | 檢查本週內容是否準備好 |
| 每月 25 日 | content-review | 回顧本月發布成果、規劃下月 |

### GitHub Actions（自動發布）

```yaml
# .github/workflows/publish.yml
name: Content Publish
on:
  push:
    branches: [main]
    paths: ['content/**']
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Discord Webhook
        run: |
          curl -H "Content-Type: application/json" \
            -d '{"content": "新內容已發布：${{ github.event.head_commit.message }}"}' \
            ${{ secrets.DISCORD_WEBHOOK }}
```

---

## 五、成效追蹤

### 指標定義

| 指標 | 追蹤方式 | 目標（首季）|
|------|----------|--------------|
| GitHub Star | GitHub 頁面 | +50 |
| Medium 閱讀量 | Medium Dashboard | 1000/月 |
| Twitter 曝光 | Twitter Analytics | 5000/月 |
| Telegram 訂閱 | Bot / Channel | 50 |
| 諮詢表單填寫 | GitHub Pages | 10/月 |
| 付費教程銷售 | Gumroad Dashboard | 20/月 |

### 月報模板

```
## [月份] 內容成效報告

### 發布統計
- 長文：X 篇
- 短筆記：X 篇
- GitHub 更新：X 次

### 流量指標
- Medium 閱讀：X
- Twitter 曝光：X
- GitHub 瀏覽：X

### 轉換
- 諮詢表單：X 份
- 付費教程：X 份

### 下月規劃
- [內容 A]
- [內容 B]
```

---

## 六、相關檔案

| 檔案 | 用途 |
|------|------|
| `content/templates/short-post.md` | 短筆記模板 |
| `content/templates/medium-article.md` | 長文模板 |
| `content/templates/github-release.md` | Release 模板 |
| `content/templates/telegram-digest.md` | Telegram 簡報模板 |
| `content/calendar/content-calendar.csv` | 行事曆（可匯入 Google Calendar）|
| `inquiry-form.md` | 諮詢表單範本 |