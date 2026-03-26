import * as vscode from 'vscode';
import {
  triggerCopilotChat,
  buildArchivePrompt,
  buildBulkArchivePrompt,
} from '../utils/copilotBridge';
import { listChanges, findOpenspecRoots } from '../parsers/changeParser';

export async function archiveChange(changeName?: string): Promise<void> {
  if (!changeName) {
    changeName = await vscode.window.showInputBox({
      prompt: 'Enter the change name to archive',
      placeHolder: 'e.g. add-idle-redpoint',
    });
  }

  if (!changeName) {
    return;
  }

  const prompt = buildArchivePrompt(changeName);
  await triggerCopilotChat(prompt);
}

export async function bulkArchive(): Promise<void> {
  const folders = (vscode.workspace.workspaceFolders ?? []).map(f => f.uri.fsPath);
  const roots = findOpenspecRoots(folders);
  if (roots.length === 0) {
    vscode.window.showWarningMessage('No openspec directory found in workspace.');
    return;
  }

  const changes = listChanges(roots[0]);
  if (changes.length === 0) {
    vscode.window.showInformationMessage('No active changes to archive.');
    return;
  }

  const picks = await vscode.window.showQuickPick(
    changes.map(c => ({
      label: c.name,
      description: c.taskProgress.total > 0
        ? `${c.taskProgress.completed}/${c.taskProgress.total} tasks`
        : '',
      picked: false,
    })),
    {
      canPickMany: true,
      placeHolder: 'Select changes to archive',
    },
  );

  if (!picks || picks.length === 0) {
    return;
  }

  const names = picks.map(p => p.label);
  const prompt = buildBulkArchivePrompt(names);
  await triggerCopilotChat(prompt);
}
