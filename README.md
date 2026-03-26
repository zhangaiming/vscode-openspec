# OpenSpec Explorer

VS Code 侧边栏扩展，用于浏览和管理工作区中的 OpenSpec changes 和 specs。

## 功能

### 浏览
- **Changes 视图**: 查看活跃 changes 列表，显示任务进度（如 3/7）、schema、创建日期
- **Specs 视图**: 浏览公共 specs，展开查看 Requirements 和 Scenarios
- **归档 changes**: 查看已归档的变更历史
- 点击任意 artifact（proposal/design/tasks/specs）直接在编辑器中打开

### 操作（通过 Copilot Chat 触发）
- **Apply**: 右键 change → Apply，触发 Copilot 执行实现任务
- **Archive**: 归档单个 change
- **Bulk Archive**: 批量归档多个 changes
- **Sync Specs**: 将 delta specs 合并到公共 specs

### 自动刷新
- 监听 `openspec/` 目录变更，TreeView 自动更新

## 安装

```bash
cd vscode-openspec
npm install
npm run package
```

生成的 `.vsix` 文件可通过 VS Code 的 "Install from VSIX..." 安装。

## 激活条件

仅在工作区包含 `openspec/config.yaml` 时激活。

## 依赖

- 不依赖 openspec CLI，直接解析文件系统
- 写操作通过 Copilot Chat 触发已有 skills 执行
