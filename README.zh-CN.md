# OpenSpec Explorer

[![GitHub Downloads](https://img.shields.io/github/downloads/zhangaiming/vscode-openspec/total)](https://github.com/zhangaiming/vscode-openspec/releases)

[English](README.md)

VS Code 侧边栏扩展，用于浏览和管理工作区中的 [OpenSpec](https://github.com/Fission-AI/OpenSpec) changes 和 specs。

## 功能

### 一键初始化
- 打开未配置 OpenSpec 的工作区时，侧边栏显示欢迎界面和 **Initialize OpenSpec** 按钮
- 检测到 `openspec` CLI 时，引导选择 AI 工具（支持 GitHub Copilot、Claude、Cursor 等 20+ 工具），通过 CLI 生成完整的目录结构和 skills
- 未安装 CLI 时，提供安装 CLI 或仅创建基本目录结构两种选项
- 所有操作仅影响工作区级别内容，不修改用户级配置

### 浏览
- **Active Changes 视图**: 查看活跃 changes 列表，显示任务进度（如 3/7）、schema、创建日期
- **Archived Changes 视图**: 查看已归档的变更历史
- **Specs 视图**: 浏览公共 specs，展开查看 Requirements 和 Scenarios
- **Spec 覆盖率热力图**: Specs 视图中每个 capability/requirement 显示有多少 active changes 涉及，图标颜色随变更密度渐变（黄 → 橙 → 红），tooltip 列出具体 change 名称
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
- 监听 `openspec/` 目录变更（包括 `config.yaml`），TreeView 自动刷新
- 所有 Copilot 提示词均可通过 `openspec.prompts.*` 设置自定义

## 安装

```bash
cd vscode-openspec
npm install
npm run deploy   # 编译、打包并安装到当前 VS Code
```

或手动打包后安装：

```bash
npm run package
# 通过 VS Code "Install from VSIX..." 安装生成的 .vsix 文件
```

## 激活条件

- 工作区包含 `openspec/config.yaml` 时自动激活
- 无 `config.yaml` 时也会激活，在侧边栏显示初始化引导

## 依赖

- 读操作（浏览 changes/specs）不依赖 openspec CLI，直接解析文件系统
- 初始化流程优先使用 `openspec` CLI（`npm install -g @fission-ai/openspec`）以生成 AI 工具 skills；无 CLI 时可创建基本目录结构
- 写操作通过 Copilot Chat 触发已有 skills 执行
