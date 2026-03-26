import * as vscode from 'vscode';

export async function openFile(filePath: string, line?: number): Promise<void> {
  const uri = vscode.Uri.file(filePath);

  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc, { preview: true });

    if (line && line > 0) {
      const position = new vscode.Position(line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenterIfOutsideViewport,
      );
    }
  } catch {
    vscode.window.showErrorMessage(`Cannot open file: ${filePath}`);
  }
}
