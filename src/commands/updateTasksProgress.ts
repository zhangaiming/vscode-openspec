import { triggerCopilotChat, buildUpdateTasksProgressPrompt } from '../utils/copilotBridge';

export async function updateTasksProgress(changeName?: string, changePath?: string): Promise<void> {
  if (!changeName || !changePath) { return; }
  const prompt = buildUpdateTasksProgressPrompt(changeName, changePath);
  await triggerCopilotChat(prompt);
}
