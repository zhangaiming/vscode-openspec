## Context

The extension renders active changes through `ActiveChangesTreeProvider`, which reads all changes from the first detected OpenSpec root and optionally groups them by date. View title commands are already used for refresh, grouping, and bulk archive actions.

## Goals / Non-Goals

**Goals:**
- Add a lightweight search action for the Active Changes view.
- Filter active changes by change name in both flat and grouped modes.
- Make the active filter visible without changing the underlying OpenSpec files.

**Non-Goals:**
- Search archived changes or specs.
- Search artifact file contents, task text, schemas, or dates.
- Add new dependencies or persistent settings.

## Decisions

- Store the search query in `ActiveChangesTreeProvider`.
  - Rationale: filtering is presentation state for a single tree view, and the provider already owns grouping and refresh behavior.
  - Alternative considered: filter inside `listChanges`; rejected because parsers should continue returning the complete file-system model.
- Add a VS Code command that prompts via `showInputBox`.
  - Rationale: VS Code tree views do not provide an inline search input, and a title action matches existing view controls.
  - Alternative considered: configuration-backed query; rejected because it is slower to use and too persistent for a quick narrowing action.
- Use a top-level `Filter: <query>` tree item with an inline clear action to show the active filter.
  - Rationale: VS Code tree view messages do not support inline buttons, while a tree item can display the filter and host a clear action on the same row.

## Risks / Trade-offs

- Search is limited to change names, so users cannot find changes by task text or capability content. This keeps the first version fast and predictable.
- The active filter row takes one line of tree space while filtering, but it makes the clear action discoverable beside the filter text.
- The filter is in-memory, so it resets when the extension reloads. That is acceptable for transient sidebar search.
