---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/638
title: Agent 角色檔案內容前端編輯器
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Pro
created: 2026-05-22
updated: 2026-05-22
howto: 實作前端編輯器讓用戶可編輯 config/{role}/ 目錄下的檔案內容
---

# T131 - Agent 角色檔案內容前端編輯器

## 目標
實作前端編輯器，讓用戶可直接在網頁面板上編輯每個角色的 config/{role}/ 目錄下的檔案內容（SOUL.md、TOOLS.md、USER.md、BOOTSTRAP.md 等）。

## 背景
目前有 9 個角色目錄：
- config/po/
- config/pm/
- config/architect/
- config/coder/
- config/security/
- config/qa/
- config/doc/
- config/researcher/
- config/devops/

每個目錄包含：
- SOUL.md（角色性格與行為準則）
- TOOLS.md（可用工具與使用規範）
- USER.md（服務對象說明）
- BOOTSTRAP.md（啟動檢查清單）
- AGENTS.md、IDENTITY.md、MEMORY.md、HEARTBEAT.md

目前這些檔案需要手動編輯，缺少前端介面。

## 驗收標準
- [x] 建立「角色管理」頁面（Role Manager）
- [x] 左側顯示角色列表（PO、PM、Architect、Coder 等）
- [x] 右側顯示所選角色的檔案列表（SOUL.md、TOOLS.md 等）
- [x] 點擊檔案可開啟編輯器（目前用 textarea，Monaco 待整合）
- [x] 支援 Markdown 語法高亮（預覽模式使用 marked）
- [x] 新增「儲存」按鈕，呼叫 API 寫入檔案
- [x] 新增「重置」按鈕，恢復預設內容
- [x] 新增「預覽」按鈕，預覽 Markdown 渲染結果
- [x] 儲存後自動觸發 PromptAssembler 快取清除
- [x] 新增 API endpoint `/api/roles/{role}/files/{filename}`
- [x] 新增 API endpoint `/api/roles/{role}/files/{filename}/reset`

**待整合**：
- [ ] Monaco Editor（需安裝 @monaco-editor/react）
- [ ] 導航欄新增 Role Manager 入口

## 實作細節

### 1. API Endpoint
```python
# frontend_api/routes/role_files.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/roles", tags=["roles"])

CONFIG_DIR = os.path.expanduser("~/Projects/mindnav-codeagent/config")

class FileContent(BaseModel):
    content: str

@router.get("/{role}/files")
async def list_role_files(role: str):
    """列出角色的所有檔案"""
    role_dir = os.path.join(CONFIG_DIR, role)
    if not os.path.isdir(role_dir):
        raise HTTPException(status_code=404, detail=f"Role '{role}' not found")
    
    files = []
    for filename in os.listdir(role_dir):
        if filename.endswith(".md"):
            filepath = os.path.join(role_dir, filename)
            files.append({
                "name": filename,
                "size": os.path.getsize(filepath),
                "modified": os.path.getmtime(filepath)
            })
    
    return {"role": role, "files": files}

@router.get("/{role}/files/{filename}")
async def get_role_file(role: str, filename: str):
    """取得角色檔案內容"""
    filepath = os.path.join(CONFIG_DIR, role, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    return {
        "role": role,
        "filename": filename,
        "content": content,
        "path": filepath
    }

@router.put("/{role}/files/{filename}")
async def update_role_file(role: str, filename: str, data: FileContent):
    """更新角色檔案內容"""
    if not filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files allowed")
    
    filepath = os.path.join(CONFIG_DIR, role, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    
    # 備份原檔案
    backup_path = filepath + ".bak"
    if os.path.exists(filepath):
        import shutil
        shutil.copy(filepath, backup_path)
    
    # 寫入新內容
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(data.content)
    
    # 清除 PromptAssembler 快取
    from engine.prompt_assembly import PromptAssembler
    PromptAssembler.load_convention_file.cache_clear()
    
    return {
        "role": role,
        "filename": filename,
        "size": len(data.content),
        "message": "File updated successfully"
    }

@router.post("/{role}/files/{filename}/reset")
async def reset_role_file(role: str, filename: str):
    """重置角色檔案為預設內容"""
    filepath = os.path.join(CONFIG_DIR, role, filename)
    backup_path = filepath + ".bak"
    
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="No backup found")
    
    import shutil
    shutil.copy(backup_path, filepath)
    
    return {"message": "File reset to backup"}
```

### 2. 前端元件
```tsx
// frontend-react/src/pages/RoleManager.tsx

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface RoleFile {
  name: string;
  size: number;
  modified: number;
}

export const RoleManager: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [files, setFiles] = useState<RoleFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    axios.get('/api/roles').then(res => setRoles(res.data.roles));
  }, []);
  
  useEffect(() => {
    if (selectedRole) {
      axios.get(`/api/roles/${selectedRole}/files`)
        .then(res => setFiles(res.data.files));
    }
  }, [selectedRole]);
  
  useEffect(() => {
    if (selectedRole && selectedFile) {
      axios.get(`/api/roles/${selectedRole}/files/${selectedFile}`)
        .then(res => setContent(res.data.content));
    }
  }, [selectedRole, selectedFile]);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(
        `/api/roles/${selectedRole}/files/${selectedFile}`,
        { content }
      );
      alert('儲存成功');
    } catch (err) {
      alert('儲存失敗');
    }
    setIsSaving(false);
  };
  
  const handleReset = async () => {
    if (!confirm('確定要重置嗎？')) return;
    await axios.post(
      `/api/roles/${selectedRole}/files/${selectedFile}/reset`
    );
    // 重新載入
    const res = await axios.get(
      `/api/roles/${selectedRole}/files/${selectedFile}`
    );
    setContent(res.data.content);
  };
  
  return (
    <div className="role-manager">
      <div className="role-sidebar">
        <h2>角色列表</h2>
        {roles.map(role => (
          <div
            key={role}
            className={`role-item ${selectedRole === role ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole(role);
              setSelectedFile('');
            }}
          >
            {role.toUpperCase()}
          </div>
        ))}
      </div>
      
      <div className="file-sidebar">
        {selectedRole && (
          <>
            <h2>檔案列表</h2>
            {files.map(file => (
              <div
                key={file.name}
                className={`file-item ${selectedFile === file.name ? 'active' : ''}`}
                onClick={() => setSelectedFile(file.name)}
              >
                <span className="file-name">{file.name}</span>
                <span className="file-size">{file.size} bytes</span>
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="file-editor">
        {selectedFile && (
          <>
            <div className="editor-toolbar">
              <span className="file-path">
                config/{selectedRole}/{selectedFile}
              </span>
              <div className="editor-actions">
                <button
                  className={isEditing ? 'active' : ''}
                  onClick={() => setIsEditing(true)}
                >
                  編輯
                </button>
                <button
                  className={isPreview ? 'active' : ''}
                  onClick={() => setIsPreview(true)}
                >
                  預覽
                </button>
                <button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? '儲存中...' : '儲存'}
                </button>
                <button onClick={handleReset}>重置</button>
              </div>
            </div>
            
            {isEditing && (
              <Editor
                height="600px"
                defaultLanguage="markdown"
                value={content}
                onChange={setContent}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on'
                }}
              />
            )}
            
            {isPreview && (
              <div className="markdown-preview">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
```

### 3. 路由配置
```tsx
// frontend-react/src/App.tsx

import { RoleManager } from './pages/RoleManager';

// 在 routes 中新增
<Route path="/roles" element={<RoleManager />} />
```

## 備註
- 使用 Monaco Editor 提供良好的編輯體驗
- 支援 Markdown 語法高亮
- 儲存後需清除 PromptAssembler 的快取
- 可考慮加入版本歷史功能

## 風險
- 編輯錯誤可能導致 agent 行為異常，需提供重置功能
- 需考慮權限控管（誰可以編輯）
