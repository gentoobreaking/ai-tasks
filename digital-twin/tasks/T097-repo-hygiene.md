---
github_issue: N/A
title: repo 衛生 — 遺留檔清理與 current_status 指標校正
type: chore
priority: low
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T097 - repo 衛生清理

## 目標
T087 之後仍有殘留雜項（2026-08-24 審查發現）：

1. **currect_status.md**：拼錯字的舊狀態檔仍被 git 追蹤。
   current_status.md:4 註明「歷史版本見 git log（原 currect_status.md）」，
   但原檔從未刪除。git rm 移除（git log 已保存歷史）
2. **任務暫存檔**：根目錄 T068-test.md / T072-test.md / T073-test.md 是當年任務
   測試產物且被追蹤 —— 移至 docs/archive/ 或刪除（內容若無保存價值）
3. **twin_pkg_tmp/**：空目錄，直接移除；.gitignore 加一行避免再出現
4. **current_status.md 指標漂移**：「306 測試通過」已過時（現為 308 passed +
   2 skipped）—— 改為不帶絕對數字的描述或同步更新；
   「統一 CLI ./twin 20 個子命令」一併核對實際數量
5. **pytest deprecation**：測試輸出有 load_module() deprecated (Python 3.15 移除)
   警告 —— 找出來源（疑似動態 import 的模組載入路徑），改用 exec_module()

## 驗收標準
- [ ] git ls-files 不含 currect_status.md / T06[78]-test.md / T073-test.md
- [ ] twin_pkg_tmp/ 目錄不存在
- [ ] current_status.md 指標與實際一致（或改為不易漂移的寫法）
- [ ] pytest -W error::DeprecationWarning（或至少無 load_module 警告）通過

## 備註
- 刪除前先確認檔案未被引用：grep currect_status、grep T068-test 等
- load_module 警告來源可用 pytest -W error::DeprecationWarning -q 重跑定位
