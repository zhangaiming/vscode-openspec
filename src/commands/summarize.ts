import { triggerCopilotChat, buildSummarizeChangePrompt, buildSummarizeSpecPrompt } from '../utils/copilotBridge';

export async function summarizeChange(changeName?: string, changePath?: string): Promise<void> {
  if (!changeName || !changePath) { return; }
  const prompt = buildSummarizeChangePrompt(changeName, changePath);
  await triggerCopilotChat(prompt);
}

export async function summarizeSpec(capability?: string, specPath?: string): Promise<void> {
  if (!capability || !specPath) { return; }
  const prompt = buildSummarizeSpecPrompt(capability, specPath);
  await triggerCopilotChat(prompt);
}
