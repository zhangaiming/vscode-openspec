## Why

Workspaces with many active OpenSpec changes become difficult to scan in the sidebar because the Active Changes view always shows the full list. A search filter lets users quickly narrow the view to relevant changes without leaving the tree.

## What Changes

- Add a search action to the Active Changes view title bar.
- Allow users to enter or clear a text query that filters active changes by change name.
- Preserve existing flat and group-by-date display modes while applying the active filter.
- Show the current filter as a top-level tree row with an inline clear action so users can tell when results are narrowed and clear it quickly.

## Capabilities

### New Capabilities
- `active-changes-browsing`: Covers browsing, grouping, and filtering active OpenSpec changes in the VS Code sidebar.

### Modified Capabilities

## Impact

- Affects `src/views/changesTreeProvider.ts` for filter state and filtered tree results.
- Affects `src/extension.ts` and `package.json` for the search command and view title action.
- No dependency or public API changes.
