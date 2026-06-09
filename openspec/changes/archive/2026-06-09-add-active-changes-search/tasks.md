## 1. Active Changes Filtering

- [x] 1.1 Add filter state and query normalization to `ActiveChangesTreeProvider`.
- [x] 1.2 Apply the filter before rendering flat or grouped active changes.
- [x] 1.3 Expose the active filter message through the registered Active Changes tree view.

## 2. Command Integration

- [x] 2.1 Add an Active Changes search command to `package.json`.
- [x] 2.2 Register the command in `src/extension.ts` using `showInputBox` and provider filter updates.
- [x] 2.3 Add an inline clear action beside the active filter indicator.

## 3. Verification

- [x] 3.1 Compile the extension with `npm run compile`.
