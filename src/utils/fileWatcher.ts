import * as vscode from 'vscode';

export class FileWatcher implements vscode.Disposable {
  private _watchers: vscode.FileSystemWatcher[] = [];
  private _debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private _onChangesChanged = new vscode.EventEmitter<void>();
  private _onSpecsChanged = new vscode.EventEmitter<void>();

  readonly onChangesChanged = this._onChangesChanged.event;
  readonly onSpecsChanged = this._onSpecsChanged.event;

  constructor() {
    // Watch changes directory
    const changesWatcher = vscode.workspace.createFileSystemWatcher(
      '**/openspec/changes/**',
    );
    changesWatcher.onDidCreate(() => this.fireChanges());
    changesWatcher.onDidChange(() => this.fireChanges());
    changesWatcher.onDidDelete(() => this.fireChanges());
    this._watchers.push(changesWatcher);

    // Watch specs directory
    const specsWatcher = vscode.workspace.createFileSystemWatcher(
      '**/openspec/specs/**',
    );
    specsWatcher.onDidCreate(() => this.fireSpecs());
    specsWatcher.onDidChange(() => this.fireSpecs());
    specsWatcher.onDidDelete(() => this.fireSpecs());
    this._watchers.push(specsWatcher);
  }

  private fireChanges(): void {
    this.debounce(() => this._onChangesChanged.fire());
  }

  private fireSpecs(): void {
    this.debounce(() => this._onSpecsChanged.fire());
  }

  private debounce(fn: () => void): void {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(fn, 500);
  }

  dispose(): void {
    for (const w of this._watchers) {
      w.dispose();
    }
    this._onChangesChanged.dispose();
    this._onSpecsChanged.dispose();
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
  }
}
