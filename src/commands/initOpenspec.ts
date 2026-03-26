import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

const DEFAULT_CONFIG = `schema: spec-driven
`;

// Supported tool IDs from https://github.com/Fission-AI/OpenSpec/blob/main/docs/supported-tools.md
const TOOL_OPTIONS: { label: string; value: string }[] = [
  { label: 'GitHub Copilot', value: 'github-copilot' },
  { label: 'Claude Code', value: 'claude' },
  { label: 'Cursor', value: 'cursor' },
  { label: 'Windsurf', value: 'windsurf' },
  { label: 'Cline', value: 'cline' },
  { label: 'Amazon Q Developer', value: 'amazon-q' },
  { label: 'Codex', value: 'codex' },
  { label: 'Continue', value: 'continue' },
  { label: 'Gemini CLI', value: 'gemini' },
  { label: 'Kiro', value: 'kiro' },
  { label: 'RooCode', value: 'roocode' },
  { label: 'Trae', value: 'trae' },
  { label: 'OpenCode', value: 'opencode' },
  { label: 'Auggie', value: 'auggie' },
  { label: 'Kilo Code', value: 'kilocode' },
  { label: 'Pi', value: 'pi' },
];

function isCliInstalled(): boolean {
  try {
    cp.execSync('openspec --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function runInTerminal(command: string, cwd: string): Promise<void> {
  const terminal = vscode.window.createTerminal({
    name: 'OpenSpec Init',
    cwd,
  });
  terminal.show();
  terminal.sendText(command);
}

export async function initOpenspec(): Promise<void> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
    return;
  }

  let target: vscode.WorkspaceFolder;
  if (folders.length === 1) {
    target = folders[0];
  } else {
    const picked = await vscode.window.showWorkspaceFolderPick({
      placeHolder: 'Select a workspace folder to initialize OpenSpec in',
    });
    if (!picked) { return; }
    target = picked;
  }

  const projectPath = target.uri.fsPath;
  const openspecRoot = path.join(projectPath, 'openspec');
  const configPath = path.join(openspecRoot, 'config.yaml');

  if (fs.existsSync(configPath)) {
    vscode.window.showInformationMessage('OpenSpec is already initialized in this workspace.');
    return;
  }

  const cliInstalled = isCliInstalled();

  if (cliInstalled) {
    await initWithCli(projectPath);
  } else {
    await initWithoutCli(projectPath, openspecRoot, configPath);
  }
}

async function initWithCli(projectPath: string): Promise<void> {
  // Let user pick which AI tools to configure skills for
  const picks = await vscode.window.showQuickPick(
    TOOL_OPTIONS.map(t => ({ label: t.label, value: t.value, picked: t.value === 'github-copilot' })),
    {
      canPickMany: true,
      placeHolder: 'Select AI tools to configure skills for (default: GitHub Copilot)',
      title: 'OpenSpec Init — Select Tools',
    },
  );

  if (!picks) { return; }

  const toolIds = picks.length > 0
    ? picks.map(p => (p as { label: string; value: string }).value).join(',')
    : 'github-copilot';

  await runInTerminal(`openspec init --tools ${toolIds} --force`, projectPath);
}

async function initWithoutCli(projectPath: string, openspecRoot: string, configPath: string): Promise<void> {
  const choice = await vscode.window.showQuickPick(
    [
      {
        label: '$(cloud-download) Install OpenSpec CLI and initialize (recommended)',
        description: 'npm install -g @fission-ai/openspec@latest && openspec init',
        value: 'install',
      },
      {
        label: '$(folder) Create basic directory structure only',
        description: 'openspec/config.yaml, specs/, changes/ — without AI tool skills',
        value: 'basic',
      },
    ],
    {
      placeHolder: 'OpenSpec CLI not found. How would you like to initialize?',
      title: 'OpenSpec Init',
    },
  );

  if (!choice) { return; }

  if (choice.value === 'install') {
    // Let user pick tools, then install CLI and run init in one terminal command
    const picks = await vscode.window.showQuickPick(
      TOOL_OPTIONS.map(t => ({ label: t.label, value: t.value, picked: t.value === 'github-copilot' })),
      {
        canPickMany: true,
        placeHolder: 'Select AI tools to configure skills for',
        title: 'OpenSpec Init — Select Tools',
      },
    );

    if (!picks) { return; }

    const toolIds = picks.length > 0
      ? picks.map(p => (p as { label: string; value: string }).value).join(',')
      : 'github-copilot';

    await runInTerminal(
      `npm install -g @fission-ai/openspec@latest && openspec init --tools ${toolIds} --force`,
      projectPath,
    );
  } else {
    // Basic directory structure only
    try {
      fs.mkdirSync(path.join(openspecRoot, 'specs'), { recursive: true });
      fs.mkdirSync(path.join(openspecRoot, 'changes'), { recursive: true });
      fs.writeFileSync(configPath, DEFAULT_CONFIG, 'utf-8');
      vscode.window.showInformationMessage(
        'OpenSpec basic structure created. Install the CLI (`npm i -g @fission-ai/openspec`) and run `openspec init` to add AI tool skills.',
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Failed to initialize OpenSpec: ${msg}`);
    }
  }
}
