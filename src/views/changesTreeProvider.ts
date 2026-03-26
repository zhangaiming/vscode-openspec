import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChangeInfo } from '../models/change';
import { listChanges, listArchivedChanges, parseChange } from '../parsers/changeParser';
import { findOpenspecRoots } from '../parsers/changeParser';

// ── Tree item types ──

type ChangeTreeItem = ChangeItem | ArtifactItem | SpecsFolderItem | DeltaSpecItem | DateGroupItem;

class ChangeItem extends vscode.TreeItem {
  constructor(public readonly change: ChangeInfo) {
    super(change.name, vscode.TreeItemCollapsibleState.Collapsed);

    const parts: string[] = [];
    if (change.taskProgress.total > 0) {
      parts.push(`${change.taskProgress.completed}/${change.taskProgress.total}`);
    }
    if (change.schema) {
      parts.push(change.schema);
    }
    if (change.created) {
      parts.push(change.created);
    }
    this.description = parts.join(' · ');

    if (change.archived) {
      this.contextValue = 'archivedChange';
      this.iconPath = new vscode.ThemeIcon('archive');
    } else {
      this.contextValue = 'activeChange';
      const allDone = change.taskProgress.total > 0 &&
        change.taskProgress.completed === change.taskProgress.total;
      this.iconPath = new vscode.ThemeIcon(allDone ? 'pass-filled' : 'circle-outline');
    }
  }
}

class ArtifactItem extends vscode.TreeItem {
  constructor(
    public readonly artifactName: string,
    public readonly filePath: string,
    public readonly exists: boolean,
  ) {
    super(artifactName, vscode.TreeItemCollapsibleState.None);

    if (exists) {
      this.iconPath = new vscode.ThemeIcon('file');
      this.command = {
        command: 'openspec.openFile',
        title: 'Open File',
        arguments: [filePath],
      };
      this.tooltip = filePath;
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-slash');
      this.description = '(missing)';
    }
    this.contextValue = 'artifact';
  }
}

class SpecsFolderItem extends vscode.TreeItem {
  constructor(
    public readonly changePath: string,
    public readonly specs: string[],
  ) {
    super('specs', specs.length > 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('folder');
    this.description = specs.length > 0 ? `${specs.length} capabilities` : '(empty)';
    this.contextValue = 'specsFolder';
  }
}

class DeltaSpecItem extends vscode.TreeItem {
  constructor(
    public readonly capability: string,
    public readonly filePath: string,
  ) {
    super(capability, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('note');
    this.command = {
      command: 'openspec.openFile',
      title: 'Open File',
      arguments: [filePath],
    };
    this.tooltip = filePath;
    this.contextValue = 'deltaSpec';
  }
}

class DateGroupItem extends vscode.TreeItem {
  constructor(
    public readonly dateLabel: string,
    public readonly changes: ChangeInfo[],
  ) {
    super(dateLabel, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('calendar');
    this.description = `${changes.length} changes`;
    this.contextValue = 'dateGroup';
  }
}

function extractDate(change: ChangeInfo): string {
  if (change.created) {
    const match = change.created.match(/\d{4}-\d{2}-\d{2}/);
    if (match) { return match[0]; }
  }
  const nameMatch = change.name.match(/^(\d{4}-\d{2}-\d{2})/);
  if (nameMatch) { return nameMatch[1]; }
  try {
    const stat = fs.statSync(path.join(change.path, '.openspec.yaml'));
    return stat.mtime.toISOString().slice(0, 10);
  } catch { /* ignore */ }
  try {
    const stat = fs.statSync(change.path);
    return stat.mtime.toISOString().slice(0, 10);
  } catch { /* ignore */ }
  return 'Unknown';
}

function groupChangesByDate(changes: ChangeInfo[]): DateGroupItem[] {
  const groups = new Map<string, ChangeInfo[]>();
  for (let i = 0; i < changes.length; i++) {
    const date = extractDate(changes[i]);
    let list = groups.get(date);
    if (!list) {
      list = [];
      groups.set(date, list);
    }
    list.push(changes[i]);
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => new DateGroupItem(date, items));
}

// ── Shared helpers ──

function getChangeChildren(change: ChangeInfo): ChangeTreeItem[] {
  if (change.archived && !change.schema) {
    const parsed = parseChange(change.path, true);
    if (parsed) {
      Object.assign(change, parsed);
    }
  }

  const children: ChangeTreeItem[] = [];

  children.push(new ArtifactItem(
    'proposal.md',
    path.join(change.path, 'proposal.md'),
    change.artifacts.proposal,
  ));
  children.push(new ArtifactItem(
    'design.md',
    path.join(change.path, 'design.md'),
    change.artifacts.design,
  ));
  children.push(new ArtifactItem(
    'tasks.md',
    path.join(change.path, 'tasks.md'),
    change.artifacts.tasks,
  ));
  children.push(new SpecsFolderItem(
    change.path,
    change.artifacts.specs,
  ));

  return children;
}

function getSpecsFolderChildren(item: SpecsFolderItem): ChangeTreeItem[] {
  return item.specs.map(cap => {
    const filePath = path.join(item.changePath, 'specs', cap, 'spec.md');
    return new DeltaSpecItem(cap, filePath);
  });
}

// ── Active Changes Provider ──

export class ActiveChangesTreeProvider implements vscode.TreeDataProvider<ChangeTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ChangeTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _workspaceFolders: string[] = [];
  private _groupByDate = false;

  constructor() {
    this.updateWorkspaceFolders();
  }

  setGroupByDate(value: boolean): void {
    this._groupByDate = value;
    this._onDidChangeTreeData.fire();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  updateWorkspaceFolders(): void {
    this._workspaceFolders = (vscode.workspace.workspaceFolders ?? [])
      .map(f => f.uri.fsPath);
  }

  getTreeItem(element: ChangeTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ChangeTreeItem): ChangeTreeItem[] {
    if (!element) {
      const roots = findOpenspecRoots(this._workspaceFolders);
      if (roots.length === 0) { return []; }
      const changes = listChanges(roots[0]);
      if (this._groupByDate) {
        return groupChangesByDate(changes);
      }
      return changes.map(c => new ChangeItem(c));
    }
    if (element instanceof DateGroupItem) {
      return element.changes.map(c => new ChangeItem(c));
    }
    if (element instanceof ChangeItem) {
      return getChangeChildren(element.change);
    }
    if (element instanceof SpecsFolderItem) {
      return getSpecsFolderChildren(element);
    }
    return [];
  }
}

// ── Archived Changes Provider ──

export class ArchivedChangesTreeProvider implements vscode.TreeDataProvider<ChangeTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ChangeTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _workspaceFolders: string[] = [];
  private _groupByDate = false;

  constructor() {
    this.updateWorkspaceFolders();
  }

  setGroupByDate(value: boolean): void {
    this._groupByDate = value;
    this._onDidChangeTreeData.fire();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  updateWorkspaceFolders(): void {
    this._workspaceFolders = (vscode.workspace.workspaceFolders ?? [])
      .map(f => f.uri.fsPath);
  }

  getTreeItem(element: ChangeTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ChangeTreeItem): ChangeTreeItem[] {
    if (!element) {
      const roots = findOpenspecRoots(this._workspaceFolders);
      if (roots.length === 0) { return []; }
      const changes = listArchivedChanges(roots[0]);
      if (this._groupByDate) {
        return groupChangesByDate(changes);
      }
      return changes.map(c => new ChangeItem(c));
    }
    if (element instanceof DateGroupItem) {
      return element.changes.map(c => new ChangeItem(c));
    }
    if (element instanceof ChangeItem) {
      return getChangeChildren(element.change);
    }
    if (element instanceof SpecsFolderItem) {
      return getSpecsFolderChildren(element);
    }
    return [];
  }
}
