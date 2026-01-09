# UI Architecture Documentation

## Overview

The UI layer (`js/ui/`) implements a modular, event-driven architecture with clear separation of concerns. It manages user interactions, state, DOM operations, and view rendering while delegating business logic to service handlers.

## Directory Structure

```
js/ui/
├── state/
│   └── state-manager.js          # Centralized UI state management
├── dom/
│   ├── dom-cache.js               # DOM element caching & validation
│   └── dom-helpers.js             # DOM manipulation utilities
├── handlers/
│   ├── action-handlers.js         # Barrel export for all handlers
│   ├── component-create-handlers.js
│   ├── component-remove-handlers.js
│   ├── component-list-handlers.js
│   ├── stats-handlers.js
│   ├── eventlog-handlers.js
│   ├── reset-handlers.js
│   ├── execute-handlers.js
│   └── auto-refresh-handlers.js   # Polling & auto-update logic
├── components/
│   ├── index.js                   # Barrel export
│   ├── component-accordion.js     # Component list rendering
│   ├── component-action.js        # Action controls builder
│   └── components-filters.js      # Room filtering logic
├── dialogs/
│   ├── index.js                   # Barrel export
│   ├── dialog-utils.js            # Shared dialog utilities
│   ├── create-dialog.js           # Component creation dialog
│   ├── remove-dialog.js           # Component removal dialog
│   └── reset-dialog.js            # System reset dialog
├── views/
│   ├── index.js                   # Barrel export
│   ├── stats-view.js              # Statistics dashboard rendering
│   └── event-log-view.js          # Event log rendering
├── event-binding.js               # Event listener management
├── init.js                        # Initialization & lifecycle
└── toast.js                       # Toast notification system
```

## Core Modules

### 1. State Management (`state/`)

**Purpose:** Centralized UI state with no external dependencies.

**state-manager.js:**

```javascript
export const state = {
  statsVisible: false,
  statsMode: 'global',           // 'global' | 'filtered'
  componentsListVisible: false,
  eventLogVisible: false,
}

export function setState(updates) { ... }
export function getState() { ... }
export function toggleStatsMode() { ... }
```

**Used by:** All handlers, auto-refresh logic, event binding

**Pattern:** Mutable state object with controlled updates via `setState()`

---

### 2. DOM Management (`dom/`)

**Purpose:** Single source of truth for DOM elements and manipulation.

**dom-cache.js:**

- `DOM_ELEMENT_IDS`: Map of all element IDs
- `el`: Cached element references
- `cacheElements()`: Populates cache from DOM
- `validateElements()`: Verifies required elements exist
- `getSelectedRoomFilter()`: Returns current room filter value
- `clearInput()`: Clears component name input

**dom-helpers.js:**

- `displayResult(message, type)`: Shows result messages
- `updateComponentItemStatus(id, action)`: Updates component UI after action

**Re-caching:** Triggered by `init()` and after HTMX `afterSwap` events

---

### 3. Event Handlers (`handlers/`)

**Architecture:** Split by concern with barrel export pattern.

#### 3.1 Action Handlers (Barrel)

**action-handlers.js:**

```javascript
export { handleCreateClick } from "./component-create-handlers.js";
export { handleRemoveClick } from "./component-remove-handlers.js";
export { handleListClick } from "./component-list-handlers.js";
export { handleToggleStatsMode, handleStatsClick } from "./stats-handlers.js";
export { handleEventLogClick } from "./eventlog-handlers.js";
export { handleResetClick } from "./reset-handlers.js";
export { handleExecuteAndToast } from "./execute-handlers.js";
```

**Purpose:** Stable API for event binding; internal structure can change without affecting consumers.

#### 3.2 Handler Responsibilities

| Handler                       | Responsibility                                            | Dependencies                                 |
| ----------------------------- | --------------------------------------------------------- | -------------------------------------------- |
| **component-create-handlers** | Opens create dialog, calls service, triggers auto-refresh | dialogs, service handlers, auto-refresh      |
| **component-remove-handlers** | Opens remove dialog, confirms, removes component          | dialogs, service handlers, auto-refresh      |
| **component-list-handlers**   | Fetches components, renders accordion with filters        | components, service handlers, state          |
| **stats-handlers**            | Displays stats (global/filtered), toggles mode            | views, service handlers, auto-refresh, state |
| **eventlog-handlers**         | Fetches and displays event log                            | views, service handlers, state               |
| **reset-handlers**            | Opens reset dialog, confirms, resets system               | dialogs, service handlers, auto-refresh      |
| **execute-handlers**          | Executes component actions (on/off/toggle), updates UI    | service handlers, auto-refresh, dom-helpers  |
| **auto-refresh-handlers**     | Polls and updates visible panels based on state flags     | All views, components, service handlers      |

#### 3.3 Auto-Refresh Logic

**Pattern:** Callback-based to avoid circular dependencies

```javascript
export function autoRefreshStats(onToggleMode) {
  if (!state.statsVisible) return;
  // Fetch stats, render with onToggleMode callback
}

export function autoRefreshComponentsList(executeAndToast) {
  if (!state.componentsListVisible) return;
  // Fetch list, render with executeAndToast callback
}

export function autoRefreshEventLog() {
  if (!state.eventLogVisible) return;
  // Fetch log, render
}
```

**Triggered by:**

- Component create/remove/reset
- Component action execution (on/off/toggle)
- Room filter change (when list or stats visible)

---

### 4. Components (`components/`)

**Purpose:** Render component lists and controls.

**component-accordion.js:**

- `displayComponentsAccordion(items, options)`: Renders expandable component list
- Options: `container`, `selectedRoom`, `executeAndToast`, `onClose`

**component-action.js:**

- `buildActionControls(component, executeAndToast)`: Builds action buttons (on/off/toggle/etc.)

**components-filters.js:**

- `applyRoomFilter(items, room)`: Filters components by room
- `populateRoomFilterOptionsFromList(items, select)`: Populates room dropdown

**Pattern:** Pure render functions accepting container and callbacks

---

### 5. Dialogs (`dialogs/`)

**Purpose:** Modal dialogs for user input.

**dialog-utils.js:**

- `RESET_OPTIONS`: Constants for reset modes
- `closeResetDialog(overlay)`: Removes dialog overlay
- `updateComponentSelectByRoom(room, items, select)`: Populates component dropdown

**create-dialog.js:**

- `createComponentDialog(defaultRoom, onSubmit, onCancel)`: Returns `{ overlay }`

**remove-dialog.js:**

- `createRemoveDialog(getComponents, onRemove, onClose, defaultRoom)`: Returns `{ overlay }`

**reset-dialog.js:**

- `createResetDialog(onReset, onClose)`: Returns `{ overlay, select }`

**Pattern:** Factory functions returning overlay elements with callbacks

---

### 6. Views (`views/`)

**Purpose:** Render read-only data panels.

**stats-view.js:**

- `displayStats(container, stats, roomStats, options)`: Renders statistics dashboard
- Options: `selectedRoom`, `statsMode`, `onToggleMode`, `onClose`
- `computeRoomStats(items, room)`: Calculates room-specific statistics
- `renderRoomStats(roomStats)`: Renders room stats section

**event-log-view.js:**

- `displayEventLog(log, options)`: Renders event log table
- Options: `container`, `onClose`

**Pattern:** Pure render functions with explicit containers and callbacks

---

### 7. Event Binding (`event-binding.js`)

**Purpose:** Attach event listeners with duplicate prevention.

**Key Features:**

- **bindOnce pattern:** Uses `__bound_${event}` flag to prevent duplicate listeners
- **HTMX-safe:** Re-binding after `afterSwap` doesn't create duplicates
- **Room filter integration:** Auto-refreshes visible panels on room change

```javascript
export function bindEvents() {
  bindOnce(el.createBtn, "click", handleCreateClick);
  bindOnce(el.removeBtn, "click", handleRemoveClick);
  // ... other buttons

  if (el.roomFilter && !el.roomFilter.__bound_change) {
    el.roomFilter.addEventListener("change", () => {
      if (state.componentsListVisible)
        autoRefreshComponentsList(handleExecuteAndToast);
      if (state.statsVisible) autoRefreshStats(handleToggleStatsMode);
    });
    el.roomFilter.__bound_change = true;
  }
}
```

---

### 8. Initialization (`init.js`)

**Purpose:** Lifecycle management and HTMX integration.

```javascript
export function init() {
  cacheElements();
  if (!validateElements()) console.warn("Missing required DOM elements");
  bindEvents();
}

export function setupAutoInit() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("htmx:afterSwap", () => {
    cacheElements(); // Re-cache after HTMX updates DOM
    bindEvents(); // Re-bind without duplicates
  });
}
```

**Entry Point:** `js/index.components-manager.js` calls `setupAutoInit()`

---

### 9. Toast Notifications (`toast.js`)

**Purpose:** User feedback for actions.

```javascript
export function showToast(message, type = 'info') { ... }
```

**Types:** `success`, `error`, `info`, `create`, `delete`, `update`

**Auto-dismiss:** 3 seconds with fade-out animation

---

## Event Flow Diagram

```
User Click
    ↓
Event Binding (event-binding.js)
    ↓
Handler (e.g., handleCreateClick)
    ↓
Open Dialog → User Input
    ↓
Service Handler (js/handlers/component-action.js)
    ↓
Smart Home Service (business logic)
    ↓
Success/Error Callback
    ↓
Toast Notification + setState()
    ↓
Auto-Refresh (if applicable)
    ↓
Fetch Updated Data
    ↓
Render Views/Components
    ↓
Update DOM
```

---

## Callback Chain Pattern

**Problem:** Avoid circular dependencies between handlers and auto-refresh.

**Solution:** Pass callbacks as parameters.

**Example:**

```javascript
// stats-handlers.js exports handleToggleStatsMode
export function handleToggleStatsMode() {
  setState({ statsMode: toggleStatsModeState() });
  autoRefreshStats(handleToggleStatsMode);  // Pass self as callback
}

// auto-refresh-handlers.js accepts callback
export function autoRefreshStats(onToggleMode) {
  // ... render stats with onToggleMode callback
  displayStats(container, stats, roomStats, { onToggleMode, ... });
}

// stats-view.js uses callback in UI
export function displayStats(container, stats, roomStats, { onToggleMode }) {
  button.addEventListener('click', onToggleMode);  // Wire callback
}
```

**Benefits:**

- No circular imports
- Clear data flow
- Testable units

---

## HTMX Integration

**Challenge:** HTMX dynamically replaces DOM elements, breaking cached references and event listeners.

**Solution:**

1. **Re-cache DOM:** `cacheElements()` after `htmx:afterSwap`
2. **Re-bind events:** `bindEvents()` with duplicate prevention
3. **Preserve state:** State object persists across swaps
4. **Auto-refresh:** Visible panels update after swap if state flags are true

**Lifecycle:**

```
Page Load
    ↓
DOMContentLoaded → init()
    ↓
HTMX loads partials → htmx:afterOnLoad
    ↓
User interacts with component
    ↓
HTMX swaps content → htmx:afterSwap
    ↓
Re-init: cacheElements() + bindEvents()
    ↓
Continue interaction
```

---

## Barrel Export Pattern

**Pattern:** Each subdirectory has an `index.js` that re-exports public API.

**Benefits:**

- **Simplified imports:** `import { displayStats } from './views/index.js'`
- **Encapsulation:** Internal file structure can change
- **Stable API:** Consumers import from one place
- **Tree-shaking:** ES6 named exports enable dead code elimination

**Examples:**

```javascript
// views/index.js
export { displayStats, computeRoomStats } from "./stats-view.js";
export { displayEventLog } from "./event-log-view.js";

// dialogs/index.js
export { createResetDialog } from "./reset-dialog.js";
export { closeResetDialog } from "./dialog-utils.js"; // Note: from utils, not reset-dialog
export { createRemoveDialog } from "./remove-dialog.js";
export { createComponentDialog } from "./create-dialog.js";

// Consumer
import { displayStats, displayEventLog } from "./views/index.js";
import { createResetDialog, closeResetDialog } from "./dialogs/index.js";
```

---

## Separation from Service Handlers

**js/handlers/** (Service Layer)

- Pure business logic
- No DOM/state dependencies
- Uses `smartHomeService` directly
- Callback-based error handling
- Examples: `handleCreateComponent`, `handleGetStats`, `handleComponentAction`

**js/ui/handlers/** (UI Layer)

- Orchestrates UI interactions
- Manages state, DOM, dialogs, toasts
- Calls service handlers
- Triggers auto-refresh
- Examples: `handleCreateClick`, `handleStatsClick`, `handleExecuteAndToast`

**No Conflicts:** Different paths, clear separation, no circular dependencies.

---

## State Management Patterns

### 1. Visibility Flags

```javascript
state.statsVisible = true; // Show stats panel
state.componentsListVisible = true; // Show components list
state.eventLogVisible = true; // Show event log
```

**Usage:** Auto-refresh checks flags before polling.

### 2. View Mode

```javascript
state.statsMode = "global"; // or 'filtered'
```

**Usage:** Determines whether to show global stats or room-specific stats.

### 3. State Updates

```javascript
setState({ statsVisible: true, statsMode: "global" });
```

**Pattern:** Object spread for partial updates.

### 4. State Access

```javascript
if (state.statsVisible) { ... }  // Direct access for reads
```

**Note:** No getter overhead for performance-critical reads.

---

## Auto-Refresh Strategy

**Trigger Conditions:**

| Action                         | Refresh Stats | Refresh List | Refresh EventLog |
| ------------------------------ | ------------- | ------------ | ---------------- |
| Create component               | ✓             | ✓            | ✓                |
| Remove component               | ✓             | ✓            | ✓                |
| Execute action (on/off/toggle) | ✓             | ✗            | ✓                |
| Reset (factory)                | ✓             | ✓            | ✓                |
| Reset (event-log)              | ✗             | ✗            | ✓                |
| Room filter change             | ✓\*           | ✓\*          | ✗                |

\* Only if panel is visible (checked via state flags)

**Implementation:**

```javascript
autoRefreshStats(handleToggleStatsMode);
autoRefreshComponentsList(handleExecuteAndToast);
autoRefreshEventLog();
```

**Optimization:** Early return if panel not visible.

---

## Best Practices

### 1. Module Boundaries

- **State:** Only `state-manager.js` mutates state
- **DOM:** Only `dom-cache.js` caches elements; `dom-helpers.js` manipulates
- **Handlers:** Business logic delegates to service handlers
- **Views:** Pure render functions, no state mutations

### 2. Dependency Direction

```
init → event-binding → handlers → auto-refresh → views/components
                ↓           ↓            ↓
              dom        state       dialogs
```

**Rule:** Higher layers import lower layers, not vice versa.

### 3. Callback Over Import

- Pass functions as parameters to avoid circular dependencies
- Examples: `onToggleMode`, `executeAndToast`, `onClose`

### 4. HTMX Safety

- Always use `bindOnce` pattern
- Re-cache DOM after swaps
- Preserve state flags across swaps

### 5. Error Handling

- Service handlers use `onSuccess`/`onError` callbacks
- UI handlers show toasts on errors
- Dialogs close on errors to prevent lock-up

### 6. Testing Considerations

- Pure functions (views, filters, compute) are unit-testable
- Handlers can be tested with mock service handlers and DOM
- State manager is independent and testable

---

## Future Enhancements

### 1. TypeScript Migration

- Add type definitions for state, callbacks, options
- Ensure type safety across module boundaries

### 2. State History

- Implement undo/redo for component actions
- Add state snapshots for debugging

### 3. Async Operations

- Add loading indicators for long operations
- Implement request cancellation

### 4. Component-Level State

- Move component-specific state (e.g., expanded accordion items) to local state
- Keep only global UI state in `state-manager`

### 5. Performance Optimization

- Implement virtual scrolling for large component lists
- Debounce auto-refresh triggers
- Cache computed room stats

### 6. Testing Infrastructure

- Add unit tests for pure functions
- Add integration tests for event flow
- Add E2E tests for critical user journeys

---

## Troubleshooting

### Issue: Buttons don't respond after HTMX swap

**Cause:** Event listeners lost after DOM replacement  
**Solution:** `htmx:afterSwap` re-binds events; verify `bindEvents()` is called

### Issue: Auto-refresh not triggered

**Cause:** State flag not set or callback missing  
**Solution:** Check `state.{panel}Visible` and verify callback passed to auto-refresh

### Issue: "Cannot read property of null" errors

**Cause:** DOM elements not cached or don't exist  
**Solution:** Verify `cacheElements()` called and `validateElements()` doesn't warn

### Issue: Circular dependency errors

**Cause:** Two modules import each other  
**Solution:** Use callback pattern; extract shared code to lower layer

### Issue: Multiple toasts for same action

**Cause:** Duplicate event listeners  
**Solution:** Verify `bindOnce` pattern used; check `__bound_` flags

---

## Summary

The UI architecture achieves:

- ✅ **Modularity:** Clear separation of concerns (state/dom/handlers/views)
- ✅ **Maintainability:** Barrel exports hide internal structure
- ✅ **Testability:** Pure functions and callback-based communication
- ✅ **HTMX Compatibility:** Safe re-initialization without duplicates
- ✅ **Performance:** Cached DOM, conditional auto-refresh, early returns
- ✅ **User Experience:** Toast feedback, smooth updates, responsive UI

This architecture scales from single-developer projects to larger teams by providing clear boundaries, stable APIs, and predictable data flow.
