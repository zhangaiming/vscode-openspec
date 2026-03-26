import * as vscode from 'vscode';
import * as fs from 'fs';
import { SpecInfo, RequirementInfo } from '../models/spec';
import { listSpecs, parseSpec } from '../parsers/specParser';
import { findOpenspecRoots } from '../parsers/changeParser';

// ── Tree item types ──

type SpecTreeItem = CapabilityItem | RequirementItem | ScenarioItem | SpecDateGroupItem;

class SpecDateGroupItem extends vscode.TreeItem {
  constructor(
    public readonly dateLabel: string,
    public readonly specs: SpecInfo[],
  ) {
    super(dateLabel, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('calendar');
    this.description = `${specs.length} specs`;
    this.contextValue = 'specDateGroup';
  }
}

class CapabilityItem extends vscode.TreeItem {
  constructor(public readonly spec: SpecInfo) {
    super(spec.capability, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = new vscode.ThemeIcon('symbol-file');
    this.tooltip = spec.path;
    this.command = {
      command: 'openspec.openFile',
      title: 'Open Spec',
      arguments: [spec.path],
    };
    this.contextValue = 'capability';
  }
}

class RequirementItem extends vscode.TreeItem {
  constructor(
    public readonly req: RequirementInfo,
    public readonly specPath: string,
  ) {
    super(req.name, req.scenarios.length > 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('checklist');
    this.description = req.scenarios.length > 0
      ? `${req.scenarios.length} scenarios`
      : '';
    this.command = {
      command: 'openspec.openFile',
      title: 'Open Requirement',
      arguments: [specPath, req.line],
    };
    this.contextValue = 'requirement';
  }
}

class ScenarioItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly specPath: string,
    public readonly line: number,
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('beaker');
    this.command = {
      command: 'openspec.openFile',
      title: 'Open Scenario',
      arguments: [specPath, line],
    };
    this.contextValue = 'scenario';
  }
}

// ── Tree Data Provider ──

export class SpecsTreeProvider implements vscode.TreeDataProvider<SpecTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SpecTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private _workspaceFolders: string[] = [];
  private _parsedSpecs = new Map<string, RequirementInfo[]>();
  private _groupByDate = false;

  constructor() {
    this.updateWorkspaceFolders();
  }

  setGroupByDate(value: boolean): void {
    this._groupByDate = value;
    this._onDidChangeTreeData.fire();
  }

  refresh(): void {
    this._parsedSpecs.clear();
    this._onDidChangeTreeData.fire();
  }

  updateWorkspaceFolders(): void {
    this._workspaceFolders = (vscode.workspace.workspaceFolders ?? [])
      .map(f => f.uri.fsPath);
  }

  getTreeItem(element: SpecTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SpecTreeItem): SpecTreeItem[] {
    if (!element) {
      return this.getRootItems();
    }

    if (element instanceof SpecDateGroupItem) {
      return element.specs.map(s => new CapabilityItem(s));
    }

    if (element instanceof CapabilityItem) {
      return this.getCapabilityChildren(element);
    }

    if (element instanceof RequirementItem) {
      return this.getRequirementChildren(element);
    }

    return [];
  }

  private getRootItems(): SpecTreeItem[] {
    const roots = findOpenspecRoots(this._workspaceFolders);
    if (roots.length === 0) {
      return [];
    }

    const root = roots[0];
    const specs = listSpecs(root);

    if (this._groupByDate) {
      const groups = new Map<string, SpecInfo[]>();
      for (let i = 0; i < specs.length; i++) {
        let date = 'Unknown';
        try {
          const stat = fs.statSync(specs[i].path);
          date = stat.mtime.toISOString().slice(0, 10);
        } catch { /* ignore */ }
        let list = groups.get(date);
        if (!list) {
          list = [];
          groups.set(date, list);
        }
        list.push(specs[i]);
      }
      return Array.from(groups.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, items]) => new SpecDateGroupItem(date, items));
    }

    return specs.map(s => new CapabilityItem(s));
  }

  private getCapabilityChildren(item: CapabilityItem): SpecTreeItem[] {
    let reqs = this._parsedSpecs.get(item.spec.path);
    if (!reqs) {
      reqs = parseSpec(item.spec.path);
      this._parsedSpecs.set(item.spec.path, reqs);
    }
    return reqs.map(r => new RequirementItem(r, item.spec.path));
  }

  private getRequirementChildren(item: RequirementItem): SpecTreeItem[] {
    return item.req.scenarios.map(s =>
      new ScenarioItem(s.name, item.specPath, s.line)
    );
  }
}
