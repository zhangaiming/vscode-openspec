import * as vscode from 'vscode';
import { triggerCopilotChat, buildApplyPrompt } from '../utils/copilotBridge';

export async function applyChange(changeName?: string): Promise<void> {
  if (!changeName) {
    changeName = await vscode.window.showInputBox({
      prompt: 'Enter the change name to apply',
      placeHolder: 'e.g. add-idle-redpoint',
    });
  }

  if (!changeName) {
    return;
  }

  const prompt = buildApplyPrompt(changeName);
  await triggerCopilotChat(prompt);
}
