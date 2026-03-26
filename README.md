# OpenSpec Explorer

VS Code 侧边栏扩展，用于浏览和管理工作区中的 OpenSpec changes 和 specs。

## 功能

### 浏览
- **Active Changes 视图**: 查看活跃 changes 列表，显示任务进度（如 3/7）、schema、创建日期
- **Archived Changes 视图**: 查看已归档的变更历史
- **Specs 视图**: 浏览公共 specs，展开查看 Requirements 和 Scenarios
- 点击任意 artifact（proposal/design/tasks/specs）直接在编辑器中打开
- 支持 **Group by Date** / **Flat View** 切换分组模式

### 操作（通过 Copilot Chat 触发）
- **Apply**: 右键 change → Apply Change，触发 Copilot 执行实现任务
- **Archive**: 归档单个 change
- **Bulk Archive**: 批量归档多个 changes
- **Sync Specs**: 将 delta specs 合并到公共 specs
- **Sync & Archive & Commit**: 一键完成 sync delta specs、archive change 和 git commit
- **Update Tasks Progress**: 对照代码实现检查并更新 tasks 完成状态
- **Summarize Change**: 生成 change 的中文摘要（目标、设计、specs、任务进度）
- **Summarize Spec**: 生成 spec 的中文摘要（职责、需求、场景）

### 其他
- **Copy Name**: 右键复制 change 名称到剪贴板
- 监听 `openspec/` 目录变更，TreeView 自动刷新
- 所有 Copilot 提示词均可通过 `openspec.prompts.*` 设置自定义

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
