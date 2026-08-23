---
github_issue: N/A
title: 日誌收斂遺留 — print 清理與靜默 except 補紀錄
type: refactor
priority: medium
status: done
depends_on:
- T085
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T096 - 日誌收斂遺留：print 清理與靜默 except 補紀錄

## 目標
T085 已統一 scheduler.py 的日誌為 structlog，但全庫仍有殘留：

1. **print 殘留**（CLI 人類可讀輸出以外的）：
   - embedding.py:48：_safe_embed 降級警告用 print —— 應走 logger.warning
     （降級是重要訊號，索引品質默默變差不該只印在 stdout）
   - worker.py:249-250：main() 啟動失敗 print 到 stderr —— 可接受（進程級錯誤），
     但成功路徑的「✅ 共處理 N 筆」建議同時 log.info，方便 daemon 日誌查詢
   - 全庫 grep "print(" 盤點一次，區分「CLI 輸出（保留）」與「內部日誌（收斂）」
2. **靜默 except Exception: pass 補紀錄**（66 處 broad catch 中的高危者）：
   - auto_guardrail.py:61,90,109：機密掃描讀檔失敗完全靜默 —— 掃描器看不到的檔案
     等於掃描漏洞，至少 log.debug(file=str(e))
   - indexer.py:144：單檔索引失敗靜默跳過 —— 應 log.warning 含檔名，
     否則使用者不知道哪些檔沒被索引
   - searcher.py:101、diff.py:491、scheduler.py:281 屬 fallback 路徑，
     補 log.debug 即可

## 驗收標準
- [ ] embedding.py / indexer.py / auto_guardrail.py 的靜默失敗皆有結構化日誌
- [ ] grep -c "except Exception" 全庫盤點表留在任務備註或 PR 描述
      （標注每處保留理由）
- [ ] NO_JSON_LOGS=0 下全套 pytest 通過（conftest JSON 日誌模式不受影響）

## 備註
- 不追求把 66 處全部改掉 —— fallback 式 broad catch 是專案刻意的容錯設計；
  本任務只處理「吞掉後無任何痕跡」的位置
