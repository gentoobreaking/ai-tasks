## Shuru vs Docker vs opencode (bwrap) 對比

### Shuru 本質

| 層面 | Shuru | Docker | opencode (bwrap) |
|------|-------|--------|------------------|
| **本質** | macOS Virtualization.framework 輕量 VM | 容器運行時（Linux namespaces/cgroups） | 用戶態沙箱（Linux bwrap / macOS Seatbelt） |
| **啟動時間** | ~2-3s（含 kernel boot） | ~1-2s（容器啟動）| **< 10ms**（用戶態）|
| **記憶體佔用** | ~200-500MB（Alpine + kernel） | ~50-100MB/容器 | **~幾 MB**（無額外佔用） |
| **隔離等級** | **硬體級**（獨立 kernel、硬體虛擬化） | 容器級（共享 kernel） | 用戶態級（依賴 kernel 實作）|
| **Root 逃逸風險** | **極低**（硬體隔離） | 低（共享 kernel） | 依賴 kernel 實作 |
| **CPU/記憶體限制** | VM 級（可精確配置） | cgroups v2 | bwrap: 依賴 cgroups/Seatbelt |
| **macOS 原生** | ✅ Virtualization.framework | ❌ 需 VM (Colima) | ✅ 原生（Linux bwrap / macOS seatbelt）|
| **啟動並發** | 單機 ~幾十個 VM | 數百容器 | **無限**（無開銷）|
| **快照/恢復** | ✅ 支援 | ❌ 需 checkpoint | ❌ |

### 關鍵差異

| 維度 | Shuru | opencode (bwrap) |
|------|-------|-----------------|
| **適用場景** | **極高安全需求、多租戶、不可信代碼執行** | **CLI 工具、測試、建構、本地開發** |
| **啟動開銷** | 每次 2-3s（冷啟動） | <10ms（幾乎零感知） |
| **資源佔用** | 常駐 ~300MB | **近零**（按需啟動）|
| **文件 I/O** | VirtIO 9p/virtio-fs（有開銷） | 直接 bind mount（原生速度）|
| **網路** | 獨立網卡、需配置 | `--unshare-net` 一行搞定 |
| **適合 `npm test`/`cargo test`** | ✅ 但啟動慢、IO 慢 | ✅ **原生速度、秒級完成** |

---

## 你的 Phase 2：可切換沙箱模式設計

**完全可行，且強烈建議做成 Strategy Pattern。**

### 架構

```go
// pkg/sandbox/sandbox.go
type Sandbox interface {
    Run(ctx context.Context, req RunRequest) (RunResult, error)
    Name() string
}

type RunRequest struct {
    Command     []string
    WorkDir     string
    Env         map[string]string
    Mounts      []Mount
    Network     bool
    CPULimit    float64
    MemoryLimit int64
    Timeout     time.Duration
}

type SandboxFactory func(config SandboxConfig) Sandbox

var Registry = map[string]SandboxFactory{
    "bwrap":    NewBwrapSandbox,      // Linux: 默認、最快
    "seatbelt": NewSeatbeltSandbox,   // macOS: 原生
    "shuru":    NewShuruSandbox,      // 高安全：硬體隔離
    "docker":   NewDockerSandbox,     // 兼容性：需要 Docker daemon
}
```

### 三種模式適用場景

| 模式 | 適用場景 | Phase 2 建議 |
|------|---------|-------------|
| **bwrap (Linux) / seatbelt (macOS)** | **預設**：`pytest`、`go test`、`cargo test`、lint、build | ✅ **Phase 2 預設** |
| **Shuru** | 高風險 task（供應鏈審計、不可信 PR、供應鏈攻擊模擬） | ✅ 可選，`risk == critical` 時切換 |
| **Docker** | 需要完整 Docker 環境、K8s 相關驗證、多容器編排 | ✅ 相容模式 |

### 配置範例

```yaml
# config.yaml
sandbox:
  default: "bwrap"           # Linux 預設
  macos_default: "seatbelt"  # macOS 預設
  modes:
    bwrap:
      enabled: true
      profile: "default"     # bwrap 參數模板
    seatbelt:
      enabled: true
      profile: "verification.sb"
    shuru:
      enabled: true
      image: "shuru/alpine:latest"
      memory: "512MiB"
      cpus: "1"
      snapshot: true         # 啟用快照加速
    docker:
      enabled: false         # 預設關，需顯式開啟
```

### 實際切換邏輯（Verification Engine）

```go
func (e *VerificationEngine) selectSandbox(task Task, policy Policy) Sandbox {
    // 高風險、安全審計、不可信 PR → Shuru
    if task.Risk == "critical" || policy.RequireHardwareIsolation {
        return factory["shuru"](config.Sandbox.Shuru)
    }
    // 需要 Docker 環境（K8s、docker-compose）
    if task.RequiresDocker {
        return factory["docker"](config.Sandbox.Docker)
    }
    // 預設：bwrap (Linux) / seatbelt (macOS)
    if runtime.GOOS == "darwin" {
        return factory["seatbelt"](config.Sandbox.Seatbelt)
    }
    return factory["bwrap"](config.Sandbox.Bwrap)
}
```

### 效能對比（你的 M2 16GB 實測預期）

| 操作 | bwrap/seatbelt | Shuru (冷啟動) | Shuru (快照恢復) | Docker (Colima) |
|------|---------------|----------------|-----------------|-----------------|
| **啟動** | **< 10ms** | ~2-3s | **~300-500ms** | ~1-2s |
| `go test ./...` (中型專案) | **5s** | 5s + 3s 啟動 | 5s + 0.5s | 5s + 1s |
| `cargo test` (中型) | **15s** | 15s + 3s | 15s + 0.5s | 15s + 1s |
| 記憶體佔用（空閒） | **~0** | ~300MB | ~300MB | ~200MB+ |
| 並發 10 個測試 | **無壓力** | 記憶體爆炸 | 可能 | 可能 |

---

## 建議

| Phase | 決策 |
|-------|------|
| **Phase 2** | **只實作 `bwrap` (Linux) + `seatbelt` (macOS) 預設模式**，先跑通 `pytest`/`go test`/`cargo test`/`npm test`。 |
| **Phase 3+** | 加入 **Shuru 作為 `risk == critical` 的可選模式**，驗證硬體隔離場景。 |
| **永遠** | **保持介面抽象**，未來可插 gVisor、Kata、Firecracker 等。 |

> **結論：** Phase 2 只要 `bwrap`/`seatbelt` 即可覆蓋 99% 驗證場景，**Shuru 留作「高風險 task 可選升級」**，架構預留介面即可，不要 Phase 2 就把所有模式都寫完。
