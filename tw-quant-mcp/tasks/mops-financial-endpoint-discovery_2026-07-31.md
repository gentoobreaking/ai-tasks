# MOPS 財報三表端點探測報告（2026-07-31 21:35）

## 目標
確立 MOPS 合併資產負債表及合併現金流量表的 API 端點路徑與呼叫方式。
這是 T012-mops-adapter 的遺留 followup 項目（Open Data CSV 端點 t187ap06/07_L 不存在）。

## 關鍵發現

### 新版 MOPS 架構
新版 MOPS (`mops.twse.com.tw/mops/`) 是 Vue/React SPA（SPA 入口為 `index.js`，467KB）。
前端透過 `redirectToOld` bridge API 將參數加密傳遞到舊版 Java servlet。

### redirectToOld API
```
POST https://mops.twse.com.tw/mops/api/redirectToOld
Content-Type: application/json
{
  "apiName": "t164sb03",
  "parameters": {"companyId":"2330","dataType":"1","season":"1","year":"2026"}
}
→ {"code":200,"result":{"url":"https://mopsov.twse.com.tw/mops/web/t164sb03?parameters=<encrypted>"}}
```

### 舊版 servlet（mopsov.twse.com.tw）不需要 CSRF
直接 POST 到 `mopsov.twse.com.tw/mops/web/ajax_t164sb0X` 即可，無需 cookie/session。

## 財報端點對照表

| 端點 (ajax_) | 報表名稱 | 單位 | 驗證 (2330 115Q1) |
|-------------|---------|------|--------------------|
| `t164sb03` | 合併資產負債表 | 新台幣仟元 | ✅ HTML table 正常回傳 |
| `t164sb04` | 合併綜合損益表 | 新台幣仟元 | ✅ 營收 1,134,103,440 (+100%) |
| `t164sb05` | 合併現金流量表 | 新台幣仟元 | ✅ 營業/投資/籌資現金流 |
| `t164sb06` | 合併權益變動表 | 新台幣仟元 | ✅ 普通股/資本公積/保留盈餘/OCI |

## 請求規格

```
POST https://mopsov.twse.com.tw/mops/web/ajax_t164sb0{3|4|5|6}
Content-Type: application/x-www-form-urlencoded

step=1&firstin=1&off=1&TYPEK=all&co_id=<symbol>&year=<YYYY>&season=<1-4>&isnew=true&queryName=co_id&inpuType=co_id&keyword4=&code1=&TYPEK2=&checkbtn=
```

- `co_id`: 4-6 碼公司代號（如 "2330"）
- `year`: 西元年（如 "2026"）
- `season`: 1-4
- `isnew`: true=IFRS 合併新式報表 / false=歷史舊式

## 回傳格式
HTML 4.01 transitional，含：
- `<h2>` 報表標題（如「合併資產負債表」）
- `<h4>` 資料來源（「本資料由台積電公司提供」）
- `<table class='hasBorder'>` 含完整會計科目明細
- 單位：新台幣仟元（需 ×1000 換算）
- 連結：XBRL 資訊平台 (`/server-java/t164sb01?CO_ID=...&REPORT_ID=C`)
- 連結：電子書查詢 (`doc.twse.com.tw/server-java/t57sb01`)

## 後續工作（T012-followup）
- [ ] 於 `pkg/provider/mops.go` 新增 3 組 Dataset 常數（BS/CF/SCE）
- [ ] 實作 HTML table parser（或考慮 XBRL 替代路徑）
- [ ] 填入 `pkg/model/mops.go` 的 `BalanceSheet` / `CashFlowStatement` struct
- [ ] 新增 cacheDataset 映射（dataset=financials, TTL=12h）
- [ ] MCP handler 實作 `get_financial_statements` (§10.D)
- [ ] fixtures 回放測試

## 備註
- XBRL 端點（`/server-java/t164sb01?step=1&CO_ID=2330&SYEAR=2026&SSEASON=1&REPORT_ID=C`）也是可解析的機器可讀 XML，可能比 HTML parsing 更穩定
- `mopsov.twse.com.tw` 是新版 MOPS 專用的舊版 servlet 代理，之前嘗試 `mops.twse.com.tw/mops/web/ajax_t164sb03` 會觸發 CSRF，但 `mopsov` 子域名不會
