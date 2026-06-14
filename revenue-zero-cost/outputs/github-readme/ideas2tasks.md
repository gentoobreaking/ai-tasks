# ideas2tasks

> 把臨時想法自動轉為結構化任務，AI 幫你追蹤到底，不再遺漏任何好點子。

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![License](https://img.shields.io/badge/License-MIT-green)
![OpenClaw](https://img.shields.io/badge/OpenClaw-Skill-orange?logo=data:image/png;base64,iVBORw0KGgo==)

## 📌 成果

| 指標 | 數值 |
|------|------|
| 已處理想法 | **21 個** |
| 自動建立任務 | **184 個** |
| 涵蓋專案 | **28+ 個** |
| 掃描頻率 | 每小時（Cron）|
| 運行成本 | **$0/月** |

## 🔧 架構

```
/Users/claw/Ideas/
       │
       │ 每小時 lifecycle.py 掃描
       ▼
┌──────────────────────────────────┐
│  state_sync.py                   │
│  ├── 正規化狀態（done/pending）  │
│  ├── 三層去重（精確/相似度）     │
│  └── merge Tasks/ 目錄 ground truth│
└───────────────┬──────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│  executor.py                     │
│  建立 Tasks/{project}/T*.md     │
└───────────────┬──────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
 GitHub Issues     GitHub Projects
       │
       ▼
   _done/  (全完成後自動歸檔)
```

## ✨ 功能

- **多格式解析**：支援 `task.N`、`[x] done`、中文 `## 待辦`、英文 `## Todo` 等格式
- **自動專案分類**：依 ideas 檔案內容自動指派至正確的 Tasks/ 專案目錄
- **三層去重防護**：
  1. 精確標題比對
  2. 正規化比對（去除 T001/URL/特殊符號）
  3. 字串相似度 > 0.8 跳過
- **Tasks/ 目錄為事實來源**：所有狀態以此為準，idea 檔為輔
- **GitHub Issues + Projects 同步**：自動建立 Issue + 加入看板
- **雙向狀態同步**：Tasks/ done → 回寫 idea 檔 `task.N done` 標記
- **自動歸檔**：所有 Tasks 皆 done → idea 自動移入 `_done/`

## 🚀 快速開始

```bash
# 1. Clone
git clone https://github.com/openclawchen8-lgtm/ideas2tasks.git
cd ideas2tasks

# 2. 安裝依賴
pip install -r requirements.txt

# 3. 設定你的 Ideas 目錄（預設 ~/.qclaw/Ideas）
export IDEAS_DIR="/path/to/your/Ideas"
export TASKS_DIR="/path/to/your/Tasks"

# 4. 首次掃描（dry-run，不建立任何檔案）
python3 lifecycle.py --dry-run

# 5. 正式執行
python3 lifecycle.py

# 6. 設定 Cron（每小時自動掃描）
echo "0 * * * * cd /path/to/ideas2tasks && python3 lifecycle.py" | crontab -
```

## 📂 支援的格式

```text
# ideas/my-project.txt

這個功能很有趣 task.1
另一個想法 task.2
[ ] 待做的項目 task.3
[x] 已完成 task.4
## Todo
- [☐] another pending task.5
```

## 📁 專案結構

```
ideas2tasks/
├── lifecycle.py           掃描 + 分類 + 去重（主入口）
├── executor.py            建立 Tasks/ 任務檔
├── state_sync.py          狀態同步核心模組
├── scripts/
│   ├── migrate_readme.py  README 自動遷移
│   └── task_audit.py      狀態稽核腳本
└── templates/
    ├── task-template.md
    └── readme-template.md
```

## ⚙️ 三層去重邏輯

```python
# 每次建立任務前，檢查是否已存在
1. exact_match(title)         # 標題完全一致 → 跳過
2. norm_match(title)          # 去除 T001 / URL / 特殊符號後一致 → 跳過
3. similarity(title) > 0.8    # 字串相似度 > 0.8 → 跳過
```

## 📂 相關資源

- [Gold Monitor Pro — 黃金自動監控系統](https://github.com/openclawchen8-lgtm/gold-monitor-pro)
- [OpenClaw 備份自動化](https://github.com/openclawchen8-lgtm/openclaw-backup)

---

> 💡 **需要個人化定制？** [填寫諮詢表單](./CONSULTATION.md)，48 小時內回覆。
