# OpenSpec Explorer

[![GitHub Downloads](https://img.shields.io/github/downloads/zhangaiming/vscode-openspec/total)](https://github.com/zhangaiming/vscode-openspec/releases)

[中文文档](README.zh-CN.md)

A VS Code sidebar extension for browsing and managing [OpenSpec](https://github.com/Fission-AI/OpenSpec) changes and specs in your workspace.

## Features

### One-Click Initialization
- When opening a workspace without OpenSpec configured, the sidebar displays a welcome view with an **Initialize OpenSpec** button
- If the `openspec` CLI is detected, guides you to select an AI tool (supports GitHub Copilot, Claude, Cursor, and 20+ others), generating the full directory structure and skills via CLI
- If the CLI is not installed, offers options to install it or create a basic directory structure only
- All operations affect workspace-level content only — no user-level configuration is modified

### Browsing
- **Active Changes view**: Browse active changes with task progress (e.g. 3/7), schema, and creation date
- **Archived Changes view**: Browse archived change history
- **Specs view**: Browse public specs, expand to view Requirements and Scenarios
- **Spec coverage heatmap**: Each capability/requirement in the Specs view shows how many active changes reference it, with icon colors graduating by density (yellow → orange → red) and tooltips listing specific change names
- Click any artifact (proposal/design/tasks/specs) to open it directly in the editor
- Toggle between **Group by Date** and **Flat View** display modes

### Actions (triggered via Copilot Chat)
- **Apply**: Right-click a change → Apply Change, triggers Copilot to execute implementation tasks
- **Archive**: Archive a single change
- **Bulk Archive**: Archive multiple changes at once
- **Sync Specs**: Merge delta specs into public specs
- **Sync & Archive & Commit**: One-click sync delta specs, archive change, and git commit
- **Update Tasks Progress**: Check implementation against code and update task completion status
- **Summarize Change**: Generate a summary of a change (goals, design, specs, task progress)
- **Summarize Spec**: Generate a summary of a spec (responsibilities, requirements, scenarios)

### Other
- **Copy Name**: Right-click to copy a change name to the clipboard
- Watches the `openspec/` directory for changes (including `config.yaml`), automatically refreshing the TreeView
- All Copilot prompts are customizable via `openspec.prompts.*` settings

## Installation

```bash
cd vscode-openspec
npm install
npm run deploy   # Compile, package, and install to current VS Code
```

Or package manually and install:

```bash
npm run package
# Install the generated .vsix file via VS Code "Install from VSIX..."
```

## Activation

- Activates automatically when the workspace contains `openspec/config.yaml`
- Without `config.yaml`, the extension still activates and shows an initialization guide in the sidebar

## Dependencies

- Read operations (browsing changes/specs) do not require the openspec CLI — files are parsed directly from the file system
- The initialization flow prefers the `openspec` CLI (`npm install -g @fission-ai/openspec`) to generate AI tool skills; without the CLI, a basic directory structure can be created
- Write operations are triggered through Copilot Chat using existing skills
