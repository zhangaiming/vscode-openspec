import * as vscode from 'vscode';
import { triggerCopilotChat, buildSyncArchiveCommitPrompt } from '../utils/copilotBridge';

export async function syncArchiveCommit(changeName?: string): Promise<void> {
    if (!changeName) {
        changeName = await vscode.window.showInputBox({
            prompt: 'Enter the change name to sync, archive & commit',
            placeHolder: 'e.g. add-idle-redpoint',
        });
    }

    if (!changeName) {
        return;
    }

    const prompt = buildSyncArchiveCommitPrompt(changeName);
    await triggerCopilotChat(prompt);
}
