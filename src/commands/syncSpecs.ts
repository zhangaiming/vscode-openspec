import * as vscode from 'vscode';
import { triggerCopilotChat, buildSyncSpecsPrompt } from '../utils/copilotBridge';

export async function syncSpecs(changeName?: string): Promise<void> {
  if (!changeName) {
    changeName = await vscode.window.showInputBox({
      prompt: 'Enter the change name to sync specs from',
      placeHolder: 'e.g. add-idle-redpoint',
    });
  }

  if (!changeName) {
    return;
  }

  const prompt = buildSyncSpecsPrompt(changeName);
  await triggerCopilotChat(prompt);
}
