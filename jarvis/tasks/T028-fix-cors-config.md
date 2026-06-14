---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/760
type: pending
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-13
howto: ~/howto
---

# T028 - 修復 CORS 配置無效問題

## 目標
修正 `app.py` 中 CORS middleware 的設定，使其符合瀏覽器安全規範。

## 驗收標準
- [ ] 移除 `allow_credentials=True` 或改用具體域名
- [ ] 確認 CORS 配置符合 FastAPI 規範
- [ ] 測試跨域請求正常工作

## 備註
當前配置 `allow_origins=["*"]` 與 `allow_credentials=True` 同時使用會被瀏覽器拒絕。