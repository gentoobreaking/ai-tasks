# 完整性與認證——webhook 冪等與時間線雜湊鏈規格

> **本檔為輸入可信度與紀錄防篡改的唯一實作依據。** 任務拆解鐵律：凡實作
> `gate/internal/ingest`、`incident/hashchain` 的任務書，驗收標準必須逐條引用本檔小節。
>
> 對應功能：F17 webhook 認證與冪等、F21 時間線防篡改雜湊鏈
> 對應模組：`gate/internal/ingest/{auth.go,idempotency.go}`、`core/src/oncall_core/incident/hashchain.py`

## E.1 webhook 認證（F17-A）

- gate 的 `/alerts` 端點強制 `Authorization: Bearer <shared_secret>`；不符 → 401
- secret 來自 env/secret 管理，與 Telegram token 分開保管
- 未认证请求計入 `/metrics`（攻擊偵測訊號）

## E.2 冪等鍵（F17-B）

- AM payload 內含 alert fingerprint → 以 `(fingerprint, status)` 作冪等鍵
- 同鍵重送 → 直接回上次處理結果，不新建 Incident、不重跑管線
- spec.md §5 標準 13：同 fingerprint 重送 3 次僅 1 個 Incident

## E.3 時間線雜湊鏈（F21）

```
event_n.hash = SHA256(event_n.payload + event_{n-1}.hash)
```

- Incident 建立時生成鏈頭（genesis = incident_id + 建立時間戳）
- 提供驗證函式 `verify_chain(incident_id)`：竄改任一筆可偵測並標記損毀位置
- UI 與 postmortem 顯示鏈驗證狀態徽章
- spec.md §5 標準 15
