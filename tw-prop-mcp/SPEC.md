# Taiwan Real-Estate Actual Transaction MCP
## Implementation Specification v2.0

**Project Type:** Taiwan Real-Estate Actual Transaction MCP  
**Primary Language:** Go  
**Database:** PostgreSQL + PostGIS  
**Protocol:** Model Context Protocol (MCP)  
**Specification Version:** v2.0  
**Architecture Principle:** Deterministic First / AI Isolation / Reproducible / Artifact Locked

---

# 0. Specification Structure

本規格拆成以下六個實際檔案：

```text
SPEC.md
DATA_MODEL.md
MCP_API.md
GIS_SPEC.md
VALUATION_SPEC.md
IMPLEMENTATION_PLAN.md
```

但六個檔案不是六個獨立設計，而是依照實作順序形成一條完整 pipeline：

```text
                    ┌──────────────────────┐
                    │  Official Data       │
                    │  實價登錄 / GIS      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ DATA ingestion       │
                    │ raw → normalized     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ PostgreSQL/PostGIS   │
                    │ immutable snapshots  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
              Parcel       Transaction      GIS
                 │             │             │
                 └─────────────┼─────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Comparable Engine    │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Valuation Engine      │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ MCP API              │
                    │ Tools / Resources    │
                    └──────────┬───────────┘
                               ▼
                         AI Agent / UI
```

---

# Chapter 1 — SPEC.md
# 系統總體規格

---

## 1.1 Project Objective

建立一個以台灣官方實價登錄資料為核心的 MCP Server，提供 AI Agent：

1. 不動產交易查詢
2. 地號／土地基本資料查詢
3. 歷史交易分析
4. 同地段 Comparable 查詢
5. 面積相近交易篩選
6. 使用分區／使用地類別篩選
7. GIS 空間分析
8. 臨路／道路距離分析
9. 交易價格統計
10. 土地估值
11. 估值依據與資料來源追溯

系統不得讓 LLM 自己「推測」官方資料。

LLM 只能：

```text
Request interpretation
        ↓
MCP tool selection
        ↓
Deterministic engine
        ↓
Structured result
        ↓
LLM explanation
```

---

## 1.2 Non-Goals

v2.0 不包含：

- 通用 AI Agent framework
- 自主交易
- 自動下單
- 自動聯絡仲介
- LLM fine-tuning
- LLM-based valuation
- LLM 自由修改資料
- 黑箱 ML 房價預測
- 自動替代政府資料來源

---

## 1.3 Core Principles

### P1 — Official Data First

交易資料優先使用內政部公開實價登錄批次資料。

官方資料目前透過政府資料開放平台與內政部實價登錄公開下載機制提供，包含交易批次資料及 schema。

---

### P2 — Raw Data Immutable

原始下載檔不得修改。

```text
raw/
  └── source_snapshot/
        ├── manifest
        ├── original_file
        ├── checksum
        ├── downloaded_at
        └── source_metadata
```

任何 normalization 都建立新的 artifact。

---

### P3 — Deterministic First

相同：

```text
dataset snapshot
+
query parameters
+
algorithm version
+
configuration
```

必須產生相同結果。

---

### P4 — AI Isolation

AI 不得直接：

```text
SQL
GIS
filesystem
valuation calculation
```

AI 只能透過 MCP tools。

---

### P5 — Artifact Locking

以下 artifact 一旦建立，不得由一般 AI workflow 修改：

```text
raw data
normalized transaction
database migration
valuation formula
valuation configuration
GIS source metadata
algorithm version
snapshot manifest
```

---

### P6 — Provenance Required

每一個交易結果必須能回答：

> 這筆資料從哪裡來？

至少包含：

```json
{
  "source": "MOI_PLVR",
  "dataset_snapshot": "2026-09-01",
  "source_file": "...",
  "record_hash": "...",
  "import_batch_id": "...",
  "algorithm_version": "v2.0"
}
```

---

# 1.4 High-Level Architecture

```text
                  ┌───────────────┐
                  │ AI Agent      │
                  └───────┬───────┘
                          │ MCP
                          ▼
                ┌───────────────────┐
                │ Go MCP Server     │
                │                   │
                │ Tool Layer        │
                └─────────┬─────────┘
                          │
                ┌─────────▼─────────┐
                │ Application       │
                │ Services          │
                └─────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
   Transaction       Comparable          GIS
     Service          Engine            Engine
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                ┌───────────────────┐
                │ Repository Layer  │
                └─────────┬─────────┘
                          ▼
                ┌───────────────────┐
                │ PostgreSQL        │
                │ + PostGIS         │
                └───────────────────┘
```

---

# 1.5 Go Technology Stack

```text
Go 1.25+
github.com/modelcontextprotocol/go-sdk/mcp
PostgreSQL
PostGIS
pgx
sqlc
Chi / net/http
OpenTelemetry
Prometheus
Docker / Kubernetes / OpenShift
```

MCP 官方 Go SDK 本身提供 `mcp.Server`、transport、tool 等 API，因此不另外引入第三方 MCP framework。

---

# 1.6 Repository Architecture

```text
taiwan-real-estate-mcp/

├── cmd/
│   └── realestate-mcp/
│       └── main.go
│
├── internal/
│   ├── mcp/
│   │   ├── server.go
│   │   ├── transaction_tools.go
│   │   ├── parcel_tools.go
│   │   ├── comparable_tools.go
│   │   ├── gis_tools.go
│   │   └── valuation_tools.go
│   │
│   ├── domain/
│   │   ├── transaction.go
│   │   ├── parcel.go
│   │   ├── geometry.go
│   │   ├── road.go
│   │   ├── comparable.go
│   │   └── valuation.go
│   │
│   ├── service/
│   │   ├── transaction.go
│   │   ├── parcel.go
│   │   ├── comparable.go
│   │   ├── gis.go
│   │   └── valuation.go
│   │
│   ├── repository/
│   │   ├── transaction.go
│   │   ├── parcel.go
│   │   ├── gis.go
│   │   └── valuation.go
│   │
│   ├── ingestion/
│   │   ├── downloader.go
│   │   ├── parser.go
│   │   ├── normalizer.go
│   │   ├── validator.go
│   │   └── snapshot.go
│   │
│   ├── gis/
│   │   ├── geometry.go
│   │   ├── parcel.go
│   │   ├── road.go
│   │   └── distance.go
│   │
│   ├── valuation/
│   │   ├── comparable.go
│   │   ├── statistics.go
│   │   ├── outlier.go
│   │   └── scoring.go
│   │
│   └── config/
│
├── migrations/
├── sql/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── gis/
│   ├── valuation/
│   └── contract/
│
├── data/
├── deployments/
├── Dockerfile
├── Makefile
│
├── SPEC.md
├── DATA_MODEL.md
├── MCP_API.md
├── GIS_SPEC.md
├── VALUATION_SPEC.md
└── IMPLEMENTATION_PLAN.md
```

---

# Chapter 2 — DATA_MODEL.md
# 資料模型與 Data Pipeline

---

## 2.1 Data Source

主要交易資料：

```text
內政部不動產買賣實價登錄公開資料
```

資料以批次檔案方式取得。

官方資料包含：

```text
MANIFEST.CSV
schema-main.csv
schema-build.csv
schema-land.csv
...
```

資料週期性發布，因此系統必須把每次下載視為一個 immutable snapshot。

---

# 2.2 Data Pipeline

```text
Download
   ↓
Checksum
   ↓
Raw Archive
   ↓
Parse
   ↓
Normalize
   ↓
Validate
   ↓
Deduplicate
   ↓
Import
   ↓
Snapshot Lock
```

---

# 2.3 Snapshot

核心 entity：

```text
dataset_snapshot
```

欄位：

```text
id
source
source_version
downloaded_at
published_at
file_name
file_sha256
record_count
status
schema_version
import_started_at
import_completed_at
```

Snapshot 一旦 `LOCKED`：

```text
UPDATE prohibited
DELETE prohibited
```

---

# 2.4 Transaction Model

核心：

```text
transaction
```

至少包含：

```text
transaction_id
snapshot_id

transaction_date
transaction_type

county
district

section
land_number

transaction_target

total_price
unit_price

land_area_sqm
building_area_sqm

urban_zoning
non_urban_zoning
land_use_category

building_type
floor
age

parking_area
parking_price

source_record_hash
```

---

# 2.5 Parcel Model

```text
parcel
```

```text
parcel_id
county
district
section
land_number

area_sqm

urban_zoning
land_use_category

geometry
centroid

source
source_version
```

Geometry：

```sql
geometry geometry(MultiPolygon, 3826)
```

若來源為 WGS84：

```text
EPSG:4326
```

則進入 PostGIS 後轉為適合台灣距離計算的座標系統。

---

# 2.6 Geometry Model

```text
parcel_geometry
```

包含：

```text
parcel_id
geometry
area_sqm
centroid
bbox
source
source_version
```

---

# 2.7 Road Model

```text
road_segment
```

欄位：

```text
road_id
name
road_class
width
geometry
source
source_version
```

注意：

> 「臨路」與「附近有道路」不是同一件事情。

系統至少區分：

```text
ROAD_ADJACENT
ROAD_NEARBY
NO_ROAD_DETECTED
UNKNOWN
```

---

# 2.8 Road Access Model

```text
parcel_road_access
```

```text
parcel_id

road_id

distance_m
nearest_point
road_width_m

access_type

source
algorithm_version
```

---

# 2.9 Provenance

所有核心資料必須有：

```text
source
source_version
snapshot_id
source_record_hash
import_batch_id
```

因此：

```text
Transaction
    ↓
Snapshot
    ↓
Official Source
```

可以完整追溯。

---

# 2.10 Database

使用：

```text
PostgreSQL + PostGIS
```

不使用 ORM。

推薦：

```text
pgx
+
sqlc
```

原因：

- SQL 可明確控制
- PostGIS 支援完整
- query 可 version control
- schema migration 可鎖定
- deterministic query 容易測試

---

# 2.11 Core Tables

```text
dataset_snapshot
import_batch

transaction
transaction_land
transaction_building

parcel
parcel_geometry

road_segment
parcel_road_access

comparable_result
valuation_result

algorithm_version
configuration_snapshot
```

---

# 2.12 Database Constraints

例如：

```sql
UNIQUE (
    snapshot_id,
    source_record_hash
)
```

防止同一 snapshot 重複 import。

土地地號：

```text
county
district
section
land_number
```

不得只依 `land_number` 判斷唯一。

---

# Chapter 3 — MCP_API.md
# MCP Interface

---

## 3.1 MCP Design Principle

MCP 是：

```text
AI → deterministic application interface
```

而不是：

```text
AI → database
```

---

# 3.2 Tool Categories

## Transaction

```text
search_transactions
get_transaction
get_transaction_statistics
```

## Parcel

```text
get_parcel
search_parcels
```

## Comparable

```text
find_comparable_transactions
score_comparable_transactions
```

## GIS

```text
get_parcel_geometry
get_parcel_location
check_road_access
find_nearby_roads
get_parcel_map_context
```

## Valuation

```text
estimate_land_value
estimate_property_value
explain_valuation
```

## Provenance

```text
get_data_snapshot
get_data_provenance
```

---

# 3.3 search_transactions

Input：

```json
{
  "county": "澎湖縣",
  "district": "西嶼鄉",
  "section": "竹篙灣段",
  "land_number": "3615",
  "date_from": "2021-01-01",
  "date_to": "2026-01-01"
}
```

Output：

```json
{
  "transactions": [],
  "statistics": {},
  "data_provenance": {}
}
```

---

# 3.4 find_comparable_transactions

Input：

```json
{
  "target": {
    "county": "澎湖縣",
    "district": "西嶼鄉",
    "section": "竹篙灣段",
    "land_number": "3615"
  },
  "filters": {
    "years": 5,
    "area_similarity_pct": 30,
    "same_zoning": true,
    "same_land_use": true,
    "road_access_required": false
  },
  "limit": 20
}
```

---

# 3.5 Comparable Result

```json
{
  "target": {},
  "comparables": [
    {
      "transaction_id": "...",
      "distance_m": 120.3,
      "area_similarity": 0.94,
      "zoning_match": true,
      "land_use_match": true,
      "road_access_match": true,
      "time_score": 0.92,
      "total_score": 0.91
    }
  ],
  "algorithm_version": "comparable-v2.0"
}
```

---

# 3.6 Tool Result Requirements

所有核心 tool response 必須包含：

```json
{
  "data": {},
  "metadata": {
    "algorithm_version": "...",
    "snapshot_id": "...",
    "generated_at": "...",
    "query_hash": "..."
  },
  "data_provenance": {}
}
```

---

# 3.7 Query Hash

將：

```text
input parameters
+
algorithm version
+
configuration version
+
snapshot
```

canonicalize 後產生：

```text
query_hash
```

用途：

```text
reproducibility
audit
cache
regression test
```

---

# 3.8 MCP Resources

除了 Tools，v2.0 可提供 Resources：

```text
realestate://snapshot/{id}

realestate://transaction/{id}

realestate://parcel/{id}

realestate://valuation/{id}

realestate://algorithm/{version}
```

---

# 3.9 Error Model

統一：

```json
{
  "error": {
    "code": "PARCEL_NOT_FOUND",
    "message": "...",
    "retryable": false
  }
}
```

Error codes：

```text
INVALID_ARGUMENT
PARCEL_NOT_FOUND
TRANSACTION_NOT_FOUND
DATA_NOT_AVAILABLE
GIS_NOT_AVAILABLE
SNAPSHOT_NOT_FOUND
VALUATION_NOT_AVAILABLE
SOURCE_UNAVAILABLE
INTERNAL_ERROR
```

---

# 3.10 AI Isolation Rules

禁止 MCP tool 接受：

```text
SQL
raw SQL WHERE
PostGIS expression
arbitrary code
valuation formula
```

例如禁止：

```json
{
  "sql": "SELECT ..."
}
```

必須：

```json
{
  "section": "竹篙灣段",
  "area_min_sqm": 100,
  "area_max_sqm": 300
}
```

由 service layer 轉成 SQL。

---

# Chapter 4 — GIS_SPEC.md
# GIS / 地籍 / 道路 / 地圖

---

## 4.1 GIS Objective

GIS 系統不是單純「把地圖畫出來」。

它必須回答：

```text
這塊地在哪裡？
形狀如何？
面積多少？
附近有哪些道路？
是否臨路？
距離道路多少？
道路寬度？
附近交易在哪？
```

---

# 4.2 GIS Sources

主要考慮：

```text
國土測繪圖資服務雲
地籍圖資網路便民服務系統
政府 GIS/Open Data
```

國土測繪圖資服務雲本身整合地籍圖、正射影像、土地使用等多種圖資，適合作為 GIS overlay 的官方來源。

地籍圖資網路便民服務系統亦提供依地號、地址等方式查詢地籍位置與相關圖資。

---

# 4.3 GIS Architecture

```text
Official GIS
     │
     ▼
GIS Adapter
     │
     ▼
Normalize Geometry
     │
     ▼
PostGIS
     │
     ├── Parcel
     ├── Road
     ├── Zoning
     └── POI
```

---

# 4.4 Coordinate System

系統內部統一：

```text
EPSG:3826
```

對外 API 可以：

```text
EPSG:4326
```

因此：

```text
API coordinates
      ↓
4326
      ↓
PostGIS transform
      ↓
3826
```

---

# 4.5 Parcel Geometry

核心：

```sql
ST_Intersects()
ST_Within()
ST_Contains()
ST_Distance()
ST_DWithin()
ST_Area()
ST_Centroid()
```

所有大量 spatial query 必須由 PostGIS 執行。

禁止：

```text
SELECT all geometry
↓
Go memory
↓
calculate distance
```

---

# 4.6 Road Access Algorithm

臨路判定不能只靠：

```text
distance < X
```

至少需要：

```text
parcel boundary
+
road geometry
+
distance
+
intersection
```

定義：

### ROAD_ADJACENT

土地邊界與道路 geometry 有直接接觸或在設定 tolerance 內。

### ROAD_NEARBY

道路在指定距離內，但無法證明土地直接臨路。

### NO_ROAD_DETECTED

指定搜尋範圍沒有道路。

### UNKNOWN

GIS source 不足。

---

# 4.7 Road Width

道路寬度來源分為：

```text
OFFICIAL
GIS_DERIVED
UNKNOWN
```

禁止從衛星圖「猜」道路寬度後當成官方資料。

---

# 4.8 Google Maps Integration

Google Maps 不作為：

```text
official cadastral source
```

而作為：

```text
visualization
satellite context
street view
navigation context
```

Google Maps JavaScript API 支援 interactive map、satellite/hybrid map 與 Street View。

架構：

```text
MCP
 │
 ├── parcel geometry
 ├── centroid
 ├── road geometry
 └── transaction locations
        │
        ▼
Frontend
        │
        ├── NLSC GIS layer
        ├── Google Satellite
        └── Google Street View
```

---

# 4.9 Street View

Street View 只提供：

```text
visual verification
```

不得將：

```text
Street View visible road
```

直接轉成：

```text
official road width
```

Google 官方 API 可依座標尋找附近 Street View panorama。

---

# 4.10 GIS Output

```json
{
  "parcel": {
    "geometry": {},
    "centroid": {}
  },
  "road_access": {
    "status": "ROAD_ADJACENT",
    "distance_m": 0,
    "road_width_m": 6,
    "width_source": "OFFICIAL"
  },
  "map_context": {
    "latitude": 23.56,
    "longitude": 119.50
  }
}
```

---

# Chapter 5 — VALUATION_SPEC.md
# Comparable / Statistics / Valuation

---

# 5.1 Valuation Principle

v2.0 不做：

```text
LLM: 我覺得這塊地值 500 萬
```

而是：

```text
Comparable transactions
        ↓
Filtering
        ↓
Scoring
        ↓
Statistics
        ↓
Adjustment
        ↓
Value range
```

---

# 5.2 Comparable Filtering

Target：

```text
T
```

Candidate：

```text
C1 ... Cn
```

第一階段 hard filters：

```text
same county
same district
same section
```

必要時：

```text
same zoning
same land-use category
```

---

# 5.3 Area Similarity

例如：

```text
target_area = 333.66 坪
```

candidate：

```text
candidate_area
```

定義：

```text
area_ratio =
candidate_area / target_area
```

距離：

```text
area_difference =
abs(candidate_area - target_area)
/
target_area
```

預設：

```text
<= 30%
```

但必須 config 化。

---

# 5.4 Time Weight

交易越接近現在，權重越高。

例如：

```text
age_months = months(now - transaction_date)

time_score =
exp(-lambda * age_months)
```

lambda 不得由 LLM 決定。

由：

```text
valuation_config
```

固定。

---

# 5.5 Spatial Weight

例如：

```text
distance_score =
exp(-distance / distance_scale)
```

其中：

```text
distance_scale
```

是 configuration。

---

# 5.6 Zoning Match

```text
same_zoning = 1
different_zoning = 0
```

---

# 5.7 Land Use Match

```text
same_land_use = 1
different_land_use = 0
```

---

# 5.8 Road Access Match

例如：

```text
target: ROAD_ADJACENT
candidate: ROAD_ADJACENT
```

則：

```text
road_access_score = 1
```

若：

```text
target: ROAD_ADJACENT
candidate: ROAD_NEARBY
```

則降低分數。

---

# 5.9 Comparable Score

第一版：

```text
total_score =
    W_area       * area_score
  + W_distance   * distance_score
  + W_time       * time_score
  + W_zoning     * zoning_score
  + W_land_use   * land_use_score
  + W_road       * road_score
```

權重必須存在於：

```text
valuation_config
```

而不是 hard-code。

---

# 5.10 Outlier Handling

至少提供：

```text
IQR
P10/P90
MAD
```

第一版建議：

```text
IQR
```

例如：

```text
Q1
Q3

IQR = Q3 - Q1

lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
```

---

# 5.11 Statistics

所有 Comparable 必須提供：

```text
count
min
P10
P25
median
mean
P75
P90
max
```

土地單價：

```text
price_per_ping
```

必須統一：

```text
1 坪 = 3.305785 平方公尺
```

---

# 5.12 Base Value

最基本：

```text
base_price_per_ping =
weighted median
```

或：

```text
median comparable unit price
```

第一版預設採：

```text
weighted median
```

原因：

對極端交易較穩健。

---

# 5.13 Valuation Range

產生：

```text
bear_value
base_value
bull_value
```

例如：

```text
bear_value = P25 adjusted
base_value = P50 adjusted
bull_value = P75 adjusted
```

不是直接使用市場最高／最低價格。

---

# 5.14 Confidence

Confidence 不代表：

> 「AI 有多相信」

而代表：

> Comparable 資料品質有多完整。

例如：

```text
HIGH
MEDIUM
LOW
INSUFFICIENT
```

依：

```text
comparable_count
area_similarity
distance
time_range
zoning_match
land_use_match
road_access_match
```

計算。

---

# 5.15 Insufficient Data

如果：

```text
comparable_count < minimum_required
```

不得硬算估值。

回傳：

```json
{
  "status": "INSUFFICIENT_DATA",
  "reason": [
    "not enough comparable transactions"
  ]
}
```

這一點非常重要。

**不能為了讓 AI 有答案而製造答案。**

---

# 5.16 Valuation Provenance

每一個估值必須記錄：

```text
valuation_id

target_parcel

snapshot_id

comparable_ids

algorithm_version

configuration_version

outlier_method

weights

statistics

created_at
```

因此可以重新執行：

```text
same snapshot
+
same config
+
same algorithm
=
same valuation
```

---

# Chapter 6 — IMPLEMENTATION_PLAN.md
# 實作順序

---

# Phase 0 — Repository Bootstrap

建立：

```text
SPEC.md
DATA_MODEL.md
MCP_API.md
GIS_SPEC.md
VALUATION_SPEC.md
IMPLEMENTATION_PLAN.md
```

建立：

```text
go.mod
Makefile
Dockerfile
README.md
```

完成：

```bash
go test ./...
go vet ./...
go build ./...
```

Acceptance:

```text
BUILD PASS
TEST PASS
```

---

# Phase 1 — PostgreSQL/PostGIS

建立：

```text
PostgreSQL
PostGIS
migration framework
sqlc
```

建立：

```text
dataset_snapshot
import_batch
transaction
parcel
```

Acceptance:

```text
migration up/down
schema test
constraint test
```

---

# Phase 2 — Official Data Downloader

實作：

```text
Downloader
Checksum
Snapshot
Archive
```

流程：

```text
download
 ↓
sha256
 ↓
store raw
 ↓
create snapshot
```

Acceptance：

```text
same source
same checksum
same snapshot
```

---

# Phase 3 — Parser / Normalizer

建立：

```text
parser
normalizer
validator
```

處理：

```text
CSV
encoding
欄位名稱
日期
價格
面積
地段
地號
使用分區
使用地類別
```

Acceptance：

```text
known sample dataset
→ expected normalized records
```

---

# Phase 4 — Transaction Engine

實作：

```text
search transaction
get transaction
statistics
```

SQL 必須經：

```text
sqlc
```

禁止：

```text
dynamic SQL from AI
```

Acceptance：

```text
query result deterministic
```

---

# Phase 5 — Parcel / GIS

建立：

```text
parcel
geometry
coordinate transformation
```

導入：

```text
official GIS source
```

Acceptance：

```text
known parcel
→ correct geometry
→ correct centroid
```

---

# Phase 6 — Road Access

實作：

```text
nearest road
road distance
road adjacency
road width
```

Acceptance：

測試：

```text
ROAD_ADJACENT
ROAD_NEARBY
NO_ROAD_DETECTED
UNKNOWN
```

四種 case 都必須存在。

---

# Phase 7 — Comparable Engine

實作：

```text
hard filter
area score
time score
distance score
zoning score
land-use score
road score
total score
```

Acceptance：

給定固定 snapshot：

```text
query
→ fixed comparable list
→ fixed scores
```

---

# Phase 8 — Statistics

實作：

```text
min
P10
P25
median
mean
P75
P90
max
```

建立 regression tests。

---

# Phase 9 — Valuation Engine

實作：

```text
bear
base
bull
confidence
```

建立：

```text
valuation_config
algorithm_version
```

Acceptance：

```text
same snapshot
same config
same algorithm
→ same valuation
```

---

# Phase 10 — MCP Server

使用官方 Go MCP SDK：

```text
github.com/modelcontextprotocol/go-sdk/mcp
```

SDK 官方 quick start 即採 `mcp.NewServer()`、`mcp.AddTool()` 等方式建立 server。

實作：

```text
search_transactions
get_transaction

get_parcel
search_parcels

find_comparable_transactions

get_parcel_geometry
check_road_access

estimate_land_value

get_data_provenance
```

---

# Phase 11 — MCP Contract Tests

建立：

```text
tests/contract/
```

測試：

```text
tool name
input schema
output schema
error schema
provenance
```

例如：

```text
search_transactions
    input schema stable
    output schema stable
```

---

# Phase 12 — Reproducibility Test

這是 v2.0 的核心測試。

執行：

```text
Query A
```

取得：

```text
result hash = X
```

重新執行：

```text
Query A
```

必須：

```text
result hash = X
```

---

# Phase 13 — Artifact Lock Test

驗證：

```text
raw data
snapshot
algorithm
valuation config
```

在 locked 狀態：

```text
UPDATE → FAIL
DELETE → FAIL
```

---

# Phase 14 — AI Isolation Test

測試 AI 是否可以：

```text
inject SQL
inject PostGIS
change valuation weights
modify snapshot
```

預期：

```text
ALL DENIED
```

---

# Phase 15 — Frontend

Frontend 不參與核心計算。

```text
React
+
TypeScript
+
Google Maps
```

功能：

```text
parcel polygon
transaction marker
road
satellite
Street View
comparable transactions
valuation result
```

Google Maps API 需要 API key / billing，因此前端整合必須另外管理 credential 與 usage。

---

# Phase 16 — Kubernetes / OpenShift

部署：

```text
Deployment
Service
ConfigMap
Secret
CronJob
ServiceMonitor
Route
```

架構：

```text
                   ┌─────────────┐
                   │ MCP Client  │
                   └──────┬──────┘
                          │
                    OpenShift Route
                          │
                   ┌──────▼──────┐
                   │ MCP Server  │
                   └──────┬──────┘
                          │
                 ┌────────▼────────┐
                 │ PostgreSQL      │
                 │ + PostGIS       │
                 └─────────────────┘

CronJob
   │
   ▼
Official Data
   │
   ▼
Importer
```

---

# Phase 17 — Observability

Metrics：

```text
mcp_requests_total
mcp_request_duration_seconds

transaction_query_total
transaction_query_duration

gis_query_total
gis_query_duration

comparable_query_total
valuation_query_total

data_import_total
data_import_errors

snapshot_locked_total
```

Logs 必須包含：

```text
request_id
tool_name
snapshot_id
algorithm_version
query_hash
```

---

# Phase 18 — Final Acceptance Test

完整測試：

```text
指定一筆土地
       ↓
取得 parcel
       ↓
取得 geometry
       ↓
判斷 road access
       ↓
查詢近 5 年交易
       ↓
same section
       ↓
similar area
       ↓
same zoning
       ↓
same land-use
       ↓
comparable ranking
       ↓
statistics
       ↓
valuation
       ↓
provenance
```

最終結果必須可以回答：

```text
這筆土地在哪？
面積多少？
是否臨路？
附近道路如何？
過去交易有哪些？
哪些交易被選為 Comparable？
為什麼選它們？
每筆交易多少錢？
每坪多少？
市場中位數多少？
估值區間多少？
使用哪個 snapshot？
使用哪個 algorithm？
使用哪組 configuration？
```

---

# 7. Definition of Done

v2.0 不以：

```text
MCP server 能啟動
```

作為完成。

必須同時滿足：

```text
[✓] Official data ingestion
[✓] Immutable snapshot
[✓] Provenance
[✓] PostgreSQL/PostGIS
[✓] Transaction query
[✓] Parcel query
[✓] GIS geometry
[✓] Road access
[✓] Comparable engine
[✓] Statistics
[✓] Valuation engine
[✓] MCP interface
[✓] Contract tests
[✓] Reproducibility
[✓] Artifact locking
[✓] AI isolation
[✓] Kubernetes deployment
```

---

# 8. v2.0 Architecture Boundary

最終系統必須維持以下邊界：

```text
┌──────────────────────────────────────────────┐
│                  AI / LLM                    │
│                                              │
│ interpretation / explanation / tool choice  │
└──────────────────────┬───────────────────────┘
                       │ MCP
                       ▼
┌──────────────────────────────────────────────┐
│                  MCP Layer                   │
│                                              │
│ schemas / validation / authorization         │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Deterministic Services          │
│                                              │
│ transaction / parcel / GIS / comparable     │
│ statistics / valuation                       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 Repository                   │
│                                              │
│ SQL / PostGIS / snapshot                     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Immutable Data Layer             │
│                                              │
│ official raw data / snapshots / provenance   │
└──────────────────────────────────────────────┘
```

**LLM 不得跨越 MCP / Service boundary。**

---

# 9. v2.0 Implementation Order Summary

真正寫 code 時，嚴格按照：

```text
01  Repository / Bootstrap
02  PostgreSQL + PostGIS
03  Snapshot Model
04  Official Data Downloader
05  Parser
06  Normalizer
07  Validator
08  Transaction Repository
09  Transaction Service
10  Parcel Model
11  GIS Adapter
12  Geometry Engine
13  Road Access Engine
14  Comparable Engine
15  Statistics Engine
16  Valuation Engine
17  Provenance
18  MCP Server
19  MCP Contract Tests
20  Reproducibility Tests
21  Artifact Lock Tests
22  AI Isolation Tests
23  Frontend
24  Kubernetes/OpenShift
25  Observability
26  End-to-End Acceptance
```

**不得反過來先做 MCP UI，再補資料層。**

---

# 10. v2.0 Core Philosophy

本專案最重要的不是：

```text
「AI 能不能回答房價？」
```

而是：

```text
「AI 所得到的答案，
是否可以被另一個人、另一台機器、
在相同資料與相同版本下重新得到？」 
```

因此：

```text
Official Data
      ↓
Immutable Snapshot
      ↓
Deterministic Computation
      ↓
Versioned Result
      ↓
MCP
      ↓
AI Explanation
```

才是本專案 v2.0 的核心架構。

---
# End of Specification v2.0