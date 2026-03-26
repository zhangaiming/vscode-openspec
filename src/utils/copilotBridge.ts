import * as vscode from 'vscode';

/**
 * Opens Copilot Chat with a pre-filled prompt.
 * Falls back to clipboard + open chat if the query param is not supported.
 */
export async function triggerCopilotChat(prompt: string): Promise<void> {
  try {
    // Fill the chat input without sending — user confirms manually
    await vscode.commands.executeCommand('workbench.action.chat.open', {
      query: prompt,
      isPartialQuery: true,
    });
  } catch {
    // Fallback: copy to clipboard and open chat panel
    await vscode.env.clipboard.writeText(prompt);
    try {
      await vscode.commands.executeCommand('workbench.action.chat.open');
    } catch {
      vscode.window.showInformationMessage(
        'Prompt copied to clipboard. Please open Copilot Chat and paste.',
      );
      return;
    }
    vscode.window.showInformationMessage(
      'Prompt copied to clipboard. Paste it in the chat input to proceed.',
    );
  }
}

function getPromptTemplate(key: string, fallback: string): string {
  const config = vscode.workspace.getConfiguration('openspec.prompts');
  return config.get<string>(key, fallback);
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, name) => vars[name] ?? `\${${name}}`);
}

export function buildApplyPrompt(changeName: string): string {
  const tpl = getPromptTemplate('apply',
    'Implement the OpenSpec change "${changeName}".');
  return interpolate(tpl, { changeName });
}

export function buildArchivePrompt(changeName: string): string {
  const tpl = getPromptTemplate('archive',
    'Archive the OpenSpec change "${changeName}".');
  return interpolate(tpl, { changeName });
}

export function buildBulkArchivePrompt(changeNames: string[]): string {
  const list = changeNames.map(n => `"${n}"`).join(', ');
  const tpl = getPromptTemplate('bulkArchive',
    'Bulk archive these OpenSpec changes: ${changeNames}.');
  return interpolate(tpl, { changeNames: list });
}

export function buildSyncSpecsPrompt(changeName: string): string {
  const tpl = getPromptTemplate('syncSpecs',
    'Sync delta specs from the OpenSpec change "${changeName}" to main specs.');
  return interpolate(tpl, { changeName });
}

export function buildUpdateTasksProgressPrompt(changeName: string, changePath: string): string {
  const tpl = getPromptTemplate('updateTasksProgress',
    '检查 OpenSpec change "${changeName}" 中 tasks 的实际完成情况，并更新 tasks 清单。阅读 ${changePath}/tasks.md，对照代码实现检查每个 task 是否已完成，更新 checkbox 状态。');
  return interpolate(tpl, { changeName, changePath });
}

export function buildSummarizeChangePrompt(changeName: string, changePath: string): string {
  const tpl = getPromptTemplate('summarizeChange',
    '请总结 OpenSpec change "${changeName}" 的内容。阅读 ${changePath} 下的 proposal.md、design.md、specs/、tasks.md，用中文给出简明摘要，包括：变更目标、设计方案要点、涉及的 spec 能力、任务完成情况。');
  return interpolate(tpl, { changeName, changePath });
}

export function buildSummarizeSpecPrompt(capability: string, specPath: string): string {
  const tpl = getPromptTemplate('summarizeSpec',
    '请总结 OpenSpec spec "${capability}" 的内容。阅读 ${specPath}，用中文给出简明摘要，包括：该能力的职责定义、关键需求列表、重要场景覆盖。');
  return interpolate(tpl, { capability, specPath });
}

export function buildSyncArchiveCommitPrompt(changeName: string): string {
  const tpl = getPromptTemplate('syncArchiveCommit',
    'Sync delta specs, archive the change, and commit for OpenSpec change "${changeName}".');
  return interpolate(tpl, { changeName });
}
