## ADDED Requirements

### Requirement: Filter active changes by name
The Active Changes view SHALL provide a user action to filter the displayed active changes by a text query matched against change names case-insensitively.

#### Scenario: Matching changes are shown
- **WHEN** the user enters a search query that matches one or more active change names
- **THEN** the Active Changes view displays only active changes whose names contain the query text

#### Scenario: Query matching ignores case
- **WHEN** the user enters a search query with different letter casing than the matching change name
- **THEN** the Active Changes view still includes that matching change

### Requirement: Clear active change filter
The Active Changes view SHALL allow the user to clear the active search filter from the active filter indicator and restore the full active change list.

#### Scenario: Empty query clears filter
- **WHEN** the user submits an empty search query
- **THEN** the Active Changes view displays the full active change list

#### Scenario: Current filter is visible
- **WHEN** a non-empty search filter is active
- **THEN** the Active Changes view shows a top-level filter indicator containing the current query

#### Scenario: Inline clear action clears filter
- **WHEN** a non-empty search filter is active and the user invokes the clear action beside the filter indicator
- **THEN** the Active Changes view clears the filter and displays the full active change list

### Requirement: Preserve active changes grouping while filtering
The Active Changes view SHALL apply the active search filter before rendering both flat and group-by-date modes.

#### Scenario: Flat view is filtered
- **WHEN** flat view mode is active and the user applies a search query
- **THEN** the Active Changes view displays only matching active changes as top-level items

#### Scenario: Grouped view is filtered
- **WHEN** group-by-date mode is active and the user applies a search query
- **THEN** the Active Changes view displays date groups containing only matching active changes
