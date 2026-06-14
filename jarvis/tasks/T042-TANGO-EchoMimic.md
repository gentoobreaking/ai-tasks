---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/774
type: Feature
priority: high
status: done
assignee: OpenCode MinniMax-M2.7
created: 2026-05-13
updated: 2026-05-23
howto: ~/howto
---

# T042 - 3D 數位人整合

## 目標
將 JARVIS 從 2D 靜態頭像升級為 3D 數位人，實現：
- 走動、躺下、趴下、發呆（Idle）等全身動作
- 語音驅動口型同步
- LLM 自主判斷動作指令

## 技術架構
```
[照片] → Tripo3D/Unique3D → [3D 模型 .glb]
                                    ↓
[Mixamo 動作] → 綁定 → [動作動畫]
                                    ↓
                    [Three.js 狀態機] ← WebSocket (audio + command)
                           ↓
                    [hud.html 3D 畫布]
```

## 當前進度

### ✅ 已完成
1. **MP4 過渡方案** - 使用 `啦啦隊員吳函峮.mp4` 作為數位人視頻
   - `assets/img/啦啦隊員吳函峮.mp4` 已就緒
   - `assets/hud.html` 整合視頻容器
   - 收到回應時自動播放 MP4，結束後回靜態頭像

2. **動作指令系統** - LLM 可輸出動作指令
   - System Prompt 加入動作引導（idle/walk/lie_down/prone/talking）
   - `pipeline/jarvis_pipeline.py` 解析 `cmd:xxx` 語法
   - WebSocket 傳送 `command` 欄位
   - 前端 `handleCommand(cmd)` 介面

3. **TTS 修復** - Kokoro MPS 記憶體問題
   - 使用 `PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0` 解決

4. **3D 模型載入** - Quaternius「Jarvis Girl」GLB
   - `assets/models/jarvis_girl.glb` (698 KB)
   - Three.js r170 via importmap + GLTFLoader
   - 場景: perspective camera + BackSide HemisphereLight + soft directional + fill rim
   - `Box3` 自動取景置中
   - 參見 `test_vrm.html` (OrbitControls 獨立測試頁)

5. **Mixamo 動畫綁定** — GLB 內含 8 組骨架動畫
   - Idle ← `HumanArmature|Idle`
   - Walk ← `HumanArmature|Walk`
   - Death (lie_down) ← `HumanArmature|Death`
   - 其餘 5 組備用 (Jump, Pickup, Run, Sitting, Swim)
   - 另加 `_talking` 程序化 AnimationClip（Head/Neck/Spine1 5Hz 擺動）

6. **Three.js 狀態機** — `createVrmRenderer()` 模組 (hud.html line ~1880)
   - `AnimationMixer` + `fadeToAction()` 平滑過渡 (0.2s crossfade)
   - 動作排隊: `queueAnimation(cmd)` → 疊加執行（如 walk+talking 可並行）
   - 閒置自動循環 Idle 動作
   - 支援動態新增 / 切換動畫

7. **VRM 模式整合到 HUD** — renderer select「3D VRM」選項
   - `switchRenderer('vrm')` 切換至 Three.js 畫布
   - `resizeVrmRenderer()` 響應 avatar frame 縮放
   - WebSocket 命令解析 + `handleCommand()` → VRM 動作驅動
   - Viseme/A2BS blendshape 訊息已預留（套用到 _talking 振幅）

8. **記憶體優化**
   - 閒置動畫幀率限縮 ~15 fps（`_scheduleIdleTick`）
   - `_stopIdleLoop()` 非 VRM 模式時停止 rAF
   - `dispose()` 釋放 GPU 資源

### ⏳ 待完成 / 可改進
1. **3D 模型生成** — 可替換為照片生成版 (Tripo3D/Meshy)
   - 目前的 Quaternius 模型為通用版
   - 如需個人化需跑 Tripo3D 付費方案

2. **口型同步** — 目前僅程序化頭部擺動
   - 模型無 blendshape rig，無法做精確 viseme
   - 替代方案：A2BS blendshape 係數 → 修改骨架 (jaw bone rotation)
   - 或切換至 T044 LivePortrait 方案

3. ~~Mixamo 動作下載~~ 已完成（GLB 內含）

4. **清理測試檔** - `test_vrm.html`、`hud_lite.html` 可刪除

## 運行方式
```bash
cd ~/Projects/JARVIS-on-mac
PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0 python app.py
```
然後開 http://localhost:8000/assets/hud.html

## 備註
- 2026-05-14：MP4 方案已通，視頻 + 聲音正常
- 2026-05-23：Three.js VRM 方案已實現，Quaternius GLB + Mixamo 動畫 + 狀態機整合完畢
- 如需精確口型同步，需 T044 MNN-LivePortrait 或 T046 TAOAvatar A2BS
- LLM 動作指令 `cmd:idle|walk|lie_down|talking` 已在 hud.html 前端生效
