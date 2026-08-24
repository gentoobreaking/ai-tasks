# LLM 輸出契約——schema 驗證與修復迴圈規格

> **本檔為 brain 輸出品質的唯一實作依據。** 任務拆解鐵律：凡實作
> `brain/{triage,schema_validator}`、`executor/` 的任務書，驗收標準必須逐條引用本檔小節。
>
> 對應功能：F14 結構化驗證與修復迴圈
> 對應模組：`core/src/oncall_core/brain/{triage.py,schema_validator.py}`、`executor/`

## C.1 輸出契約（TriageReport JSON schema）

```json
{
  "incident_id": "string",
  "hypotheses": [                       // 1–5 項，依信心度遞減
    {"cause": "string", "confidence": 0.0-1.0, "evidence": ["context/RAG 引用"]}
  ],
  "suggested_actions": [
    {"action": "string",
     "risk": "read-only | mutating",    // 枚舉，其他值視為無效
     "runbook_ref": "string|null"}
  ],
  "missing_context": ["string"],        // A.5 降級模式時必須非空
  "prompt_version": "semver"
}
```

## C.2 修復迴圈

```
LLM 生成 → json.loads + schema 驗證
  通過 → 下游
  失敗 → 將驗證錯誤訊息併入 prompt 重問一次（repair prompt）
       → 再失敗 → 降級：不產生分診報告，改推純 context 摘要＋RAG 相似事故連結
                  （token 預算照扣；時間線記錄 schema_failure）
```

- repair prompt 至多一次；禁止無限重試燒 token
- executor 對未通過驗證的輸入**硬拒絕**——即使人類手動批准也不執行

## C.3 測試要求

- 壞輸出語料集 ≥8 案例：截斷 JSON、幻覺 enum、缺欄位、型別錯誤、markdown 包裹、空陣列…
- 每案例斷言：repair 觸發次數、最終降級路徑、token 計數
