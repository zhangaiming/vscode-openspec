import * as vscode from 'vscode';
import { ActiveChangesTreeProvider, ArchivedChangesTreeProvider } from './views/changesTreeProvider';
import { SpecsTreeProvider } from './views/specsTreeProvider';
import { FileWatcher } from './utils/fileWatcher';
import { openFile } from './commands/openFile';
import { applyChange } from './commands/applyChange';
import { archiveChange, bulkArchive } from './commands/archiveChange';
import { syncSpecs } from './commands/syncSpecs';
import { syncArchiveCommit } from './commands/syncArchiveCommit';
import { summarizeChange, summarizeSpec } from './commands/summarize';
import { updateTasksProgress } from './commands/updateTasksProgress';

export function activate(context: vscode.ExtensionContext): void {
  // Tree providers
  const activeChangesProvider = new ActiveChangesTreeProvider();
  const archivedChangesProvider = new ArchivedChangesTreeProvider();
  const specsProvider = new SpecsTreeProvider();

  // Initialize grouping context
  vscode.commands.executeCommand('setContext', 'openspec:changesGroupByDate', false);
  vscode.commands.executeCommand('setContext', 'openspec:archivedGroupByDate', false);
  vscode.commands.executeCommand('setContext', 'openspec:specsGroupByDate', false);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('openspec-changes', activeChangesProvider),
    vscode.window.registerTreeDataProvider('openspec-archived', archivedChangesProvider),
    vscode.window.registerTreeDataProvider('openspec-specs', specsProvider),
  );

  // File watcher for auto-refresh
  const watcher = new FileWatcher();
  watcher.onChangesChanged(() => {
    activeChangesProvider.refresh();
    archivedChangesProvider.refresh();
  });
  watcher.onSpecsChanged(() => specsProvider.refresh());
  context.subscriptions.push(watcher);

  // Handle workspace folder changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      activeChangesProvider.updateWorkspaceFolders();
      archivedChangesProvider.updateWorkspaceFolders();
      specsProvider.updateWorkspaceFolders();
      activeChangesProvider.refresh();
      archivedChangesProvider.refresh();
      specsProvider.refresh();
    }),
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('openspec.refreshChanges', () => {
      activeChangesProvider.refresh();
    }),
    vscode.commands.registerCommand('openspec.refreshArchived', () => {
      archivedChangesProvider.refresh();
    }),
    vscode.commands.registerCommand('openspec.refreshSpecs', () => {
      specsProvider.refresh();
    }),
    vscode.commands.registerCommand('openspec.openFile', (filePath: string, line?: number) => {
      openFile(filePath, line);
    }),
    vscode.commands.registerCommand('openspec.applyChange', (item?: { change?: { name?: string } }) => {
      applyChange(item?.change?.name);
    }),
    vscode.commands.registerCommand('openspec.archiveChange', (item?: { change?: { name?: string } }) => {
      archiveChange(item?.change?.name);
    }),
    vscode.commands.registerCommand('openspec.bulkArchive', () => {
      bulkArchive();
    }),
    vscode.commands.registerCommand('openspec.syncSpecs', (item?: { change?: { name?: string } }) => {
      syncSpecs(item?.change?.name);
    }),
    vscode.commands.registerCommand('openspec.syncArchiveCommit', (item?: { change?: { name?: string } }) => {
      syncArchiveCommit(item?.change?.name);
    }),
    vscode.commands.registerCommand('openspec.summarizeChange', (item?: { change?: { name?: string; path?: string } }) => {
      summarizeChange(item?.change?.name, item?.change?.path);
    }),
    vscode.commands.registerCommand('openspec.summarizeSpec', (item?: { spec?: { capability?: string; path?: string } }) => {
      summarizeSpec(item?.spec?.capability, item?.spec?.path);
    }),
    vscode.commands.registerCommand('openspec.updateTasksProgress', (item?: { change?: { name?: string; path?: string } }) => {
      updateTasksProgress(item?.change?.name, item?.change?.path);
    }),
    vscode.commands.registerCommand('openspec.copyChangeName', (item?: { change?: { name?: string } }) => {
      const name = item?.change?.name;
      if (name) {
        vscode.env.clipboard.writeText(name);
      }
    }),
    vscode.commands.registerCommand('openspec.collapseAll', () => {
      // handled by VS Code built-in collapse
    }),
    vscode.commands.registerCommand('openspec.changesGroupByDate', () => {
      activeChangesProvider.setGroupByDate(true);
      vscode.commands.executeCommand('setContext', 'openspec:changesGroupByDate', true);
    }),
    vscode.commands.registerCommand('openspec.changesFlatView', () => {
      activeChangesProvider.setGroupByDate(false);
      vscode.commands.executeCommand('setContext', 'openspec:changesGroupByDate', false);
    }),
    vscode.commands.registerCommand('openspec.archivedGroupByDate', () => {
      archivedChangesProvider.setGroupByDate(true);
      vscode.commands.executeCommand('setContext', 'openspec:archivedGroupByDate', true);
    }),
    vscode.commands.registerCommand('openspec.archivedFlatView', () => {
      archivedChangesProvider.setGroupByDate(false);
      vscode.commands.executeCommand('setContext', 'openspec:archivedGroupByDate', false);
    }),
    vscode.commands.registerCommand('openspec.specsGroupByDate', () => {
      specsProvider.setGroupByDate(true);
      vscode.commands.executeCommand('setContext', 'openspec:specsGroupByDate', true);
    }),
    vscode.commands.registerCommand('openspec.specsFlatView', () => {
      specsProvider.setGroupByDate(false);
      vscode.commands.executeCommand('setContext', 'openspec:specsGroupByDate', false);
    }),
  );
}
