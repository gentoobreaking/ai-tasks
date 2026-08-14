# T068/T069/T070 批次執行紀錄（2026-08-12）

## 目標
依序完成 digital-twin 專案三個任務，每項驗收後 commit + 更新任務書/摘要/README，再進行下一項。

## T068 - scheduler process_task 頂層例外防護（high）✅
- commit `34fd968`（實作）+ `10f55a6`（README）
- `scheduler.py run()` 對 `process_task` 包 try/except（不吞 KeyboardInterrupt/SystemExit）：未預期例外 → `observability.exception` + `_record_failure`（blocked 升級 + review + Telegram 推播）→ 回傳 False，`skipped_this_run` 防同次重試；已 commit 後錯誤僅通知、不觸發 git revert。
- 處理既有半成品：run() 冗餘局部 notify import（繞過頂層 patch）移除、last_err 清理。
- tests/test_scheduler_exception_guard.py 5 測試；全量 251 passed → 最終 254（隨 T069 增加）。
- 任務書 status done、驗收勾選；2026-08-12-T068-summary.md；README 新增段落。

## T069 - embedding 降級契約修復（medium）✅
- commit `1e1623f`（實作）+ `8beaed3`（README）
- `get_provider()`：`EMBEDDING_PROVIDER=openai` 缺 `OPENAI_API_KEY` 時攔截建構 ValueError → 降級 `HashEmbeddingProvider`（沿用 EMBEDDING_DIM），不再 raise。direct `OpenAIProvider()` 仍 raise（語意保留）。
- 基底類別補 `api_key` 屬性（pyright）。
- tests/test_embedding.py +3（缺 key 降級/維度沿用/key 存在仍 openai）；全量 254 passed。
- 任務書/摘要/README 更新。

## T070 - telegram webhook secret token 驗證（high）✅
- commit `e16b61d`（實作）+ `18935fd`（README）
- `/api/webhook`：`TELEGRAM_WEBHOOK_SECRET` 設定後校驗 `X-Telegram-Bot-Api-Secret-Token`（hmac.compare_digest），缺失/不符 → 401；未設定維持原行為。
- `scripts/set-tele-webhook.sh` 註冊自動帶 `secret_token`；`.env.example` 新增變數；`docker-compose.prod.yml` 透傳。
- tests/test_telegram_bot.py +4；全量 258 passed, 1 skipped。
- pyright：telegram_bot.py 無錯誤；測試檔 7 errors 為既有 circuit-breaker 存量（git stash 驗證）。
- 任務書/摘要/README 更新。

## 其他
- 清理 T068-test.md 暫存檔（frontmatter 顯示 fail_count: 1 的舊測試暫存）。
- git log：34fd968 → 10f55a6 → 1e1623f → 8beaed3 → e16b61d → 18935fd。
- 工作區乾淨（git status 無未提交變更）。
