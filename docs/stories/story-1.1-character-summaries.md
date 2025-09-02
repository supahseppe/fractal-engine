<!-- Powered by BMAD™ Core -->

# Create Brownfield Story Task

## What was implemented

Step 3: Character list with Add/Edit/Delete, accessible inline form with 280-char summary soft limit, AI "Generate with AI" entry via [CharacterView.suggestCharacters()](js/ui/character-view.js:577) and modal-driven selection, Dexie persistence, and store integration via [useStore](js/store.js:41).

### Architecture Components

- **UI**: [character-view.js](js/ui/character-view.js) - Lit component for character management
- **Store**: [store.js](js/store.js) - Zustand state management with character slice
- **DB**: [db.js](js/db.js) - Dexie IndexedDB wrapper with characters table
- **AI**: [api.js](js/api.js) - OpenRouter API integration for character suggestions

## UX Behaviors

### Navigation

Step 3 appears when `currentStep === 3`, with focus moving to [#step-3-heading](index.html:42) upon navigation as wired in [app.js](js/app.js:71).

### Empty State

When no characters exist, the view shows a clear empty state with:
- Heading: "Build your cast"
- Description: "Create characters manually or generate suggestions with AI to get started."
- Dual CTAs: "Add character" and "Generate with AI" buttons

### List

The character list displays cards with:
- **Card Anatomy**: Name (heading) and summary (paragraph)
- **Actions**: Edit and Delete buttons on each card
- **Delete Confirmation**: Inline confirmation replaces old window.confirm with "Confirm delete?" prompt and Delete/Cancel buttons

### Form

The inline character form includes:
- **Fields**: Name (text input) and Summary (textarea)
- **Validation**: Both fields required; summary has 280-character soft limit
- **Character Counter**: Shows current/280 count with visual indication when over limit
- **Keyboard Behavior**: Enter submits form (except when focus is on textarea), Escape closes form or cancels delete
- **Focus Management**: Returns to appropriate element after form submission or cancellation
- **Error Handling**: Validation messages use `aria-invalid` and `aria-describedby` for accessibility

### Accessibility

- **Focus Management**: Heading focus management with `tabindex="-1"` on [#step-3-heading](index.html:42)
- **Labeled Controls**: All form inputs have proper labels
- **Touch Targets**: Adequate sizing for all interactive elements
- **ARIA Attributes**: Proper use of `aria-invalid`, `aria-describedby`, and `aria-label`
- **Screen Reader Support**: Badge count a11y on the Step 3 link in [project-sidebar.js](js/ui/project-sidebar.js:114)

## Data Model and Persistence

### Dexie Schema

Characters are stored in IndexedDB via [db.characters](js/db.js:12) with the following schema:
- `id` (auto-incrementing primary key)
- `name` (string)
- `summary` (string)
- `createdAt` (number - timestamp)
- `updatedAt` (number - timestamp)

### Migration Strategy

The implementation uses an additive migration strategy:
- Database changes are additive only, preserving existing data
- Version 4 migration adds `createdAt` and `updatedAt` fields to the characters table
- Backfill migration populates timestamps for existing characters during upgrade
- Existing stores and data remain intact

### Sorting Recommendations

Characters are sorted by `updatedAt` index for better user experience, showing recently modified characters first.

## Store API Surface

The character-slice of the Zustand store provides the following actions with optimistic updates and rollback semantics:

### Actions

- [getCharacters()](js/store.js:51): Returns `Character[]` array of all characters
- [loadCharacters()](js/store.js:57): Idempotent load from database, sets `isCharactersLoaded` flag
- [addCharacter(input)](js/store.js:75): Optimistic insert with temp ID, rollback on failure
- [updateCharacter(update)](js/store.js:130): Optimistic patch, throws `Error('Character not found')` if missing, rollback on failure
- [deleteCharacter(id)](js/store.js:175): Optimistic remove, throws `Error('Character not found')` if missing, rollback on failure

### Example Flow

```javascript
// Load characters (idempotent)
await store.getState().loadCharacters();

// Add a new character
const newCharacter = await store.getState().addCharacter({
  name: 'Protagonist',
  summary: 'A brave hero on a quest'
});

// Update a character
await store.getState().updateCharacter({
  id: newCharacter.id,
  name: 'Hero',
  summary: 'A courageous hero on an epic quest'
});

// Delete a character
await store.getState().deleteCharacter(newCharacter.id);
```

## AI Suggest-Characters Flow

### Entry Point

"Generate with AI" in Step 3 triggers [AIModal.launch('suggest-characters')](js/ui/ai-modal.js:189) via [CharacterView.suggestCharacters()](js/ui/character-view.js:577).

### Prompt Composition

[callOpenRouterAPI()](js/api.js:8) uses Steps 1–2 content to compose a prompt requesting a JSON array `[{name, summary}]` with:
- 5 distinct, archetype-varied characters
- 1–2 sentence summaries (max 280 chars)
- Concrete, specific details grounded in story context
- No duplicates or worldbuilding dumps

### Response Handling

- Robust JSON parsing with recovery for common formatting issues
- Invalid items are skipped with validation (name and summary required, non-empty)
- Summary length is clamped to 280 characters defensively
- Errors render in modal with raw response for debugging

### Modal Behavior

In 'suggest-characters' mode:
- Footer shows "Add Selected" button that bulk applies selected characters
- Single "Apply" on a card calls [AIModal._handleApplyCharacter()](js/ui/ai-modal.js:307)
- Backward compatibility retained for Steps 1–2 ("apply to step" and "Synthesize")

## Sidebar Badge

The Step 3 link in [project-sidebar.js](js/ui/project-sidebar.js:110) displays a live count badge showing the number of characters. The badge updates with state changes and includes an `aria-label` that provides screen reader users with the character count (e.g., "3. Character Summaries, 5 characters").

## Testing Guidance

### Unit Tests

Character functionality is covered by comprehensive unit tests:
- Store actions: [js/ui/tests/store-characters.test.js](js/ui/tests/store-characters.test.js)
- CharacterView CRUD operations: [js/ui/tests/character-view.test.js](js/ui/tests/character-view.test.js)
- Dexie is mocked via `vi.mock` for isolated testing
- JSDOM environment provides DOM simulation
- Test coverage is enforced at ≥80% in [vitest.config.js](vitest.config.js)

### Manual QA Checklist

- Navigate to Step 3 and verify focus moves to [#step-3-heading](index.html:42)
- Verify empty state displays with both CTAs
- Test Add/Edit/Delete flows with validation and focus management
- Test Enter/Escape keyboard behavior in forms
- Verify character counter behavior at/over 280 characters
- Test AI suggestions end-to-end (trigger, generate, apply)
- Verify persistence across page reloads
- Test screen-reader expectations (focus management, aria attributes)
- Verify no console errors during normal operation

## Risk, Monitoring, and Rollback

### Additive Migration Safety

The database schema changes are additive only, preserving all existing data. If issues surface with the character functionality, the UI entry points can be disabled:
- Remove or comment out the character view navigation in sidebar
- Guard the 'suggest-characters' mode in the AI modal

### Malformed AI Response Handling

Robust JSON parsing with recovery handles common formatting issues from the AI:
- Strips markdown code fences if present
- Validates each character object has required fields
- Skips invalid items with clear error messaging
- Shows raw response for debugging when parsing fails

### Behavior Isolation

Step 3 behaviors are isolated from other steps:
- Character state is managed separately in the store
- Database changes only affect the characters table
- UI components are self-contained

### Rollback Steps

If critical issues are discovered:
1. Disable character UI entry in navigation or guard modal 'suggest-characters' mode
2. Existing character data remains intact because schema changes are additive
3. For local development recovery, clear the app's IndexedDB:
   - Open DevTools → Application → IndexedDB → SnowflakeProject
   - Right-click and select "Delete" or "Clear"

## Screenshots

![Step 3 Empty State](./images/step3-empty.png)

![Add Form with Validation](./images/step3-add-form.png)

![Character List with Edit/Delete](./images/step3-character-list.png)

![AI Modal with Character Suggestions](./images/step3-ai-modal.png)

## Mapping to Implementation

This section maps the original acceptance criteria to their implementation in the delivered features:

| Criteria | Implementation |
|---------|----------------|
| 1. A new "Characters" view is available in the sidebar | Implemented in [project-sidebar.js](js/ui/project-sidebar.js) with live count badge |
| 2. Users can manually add a new character with a name and a summary | Implemented in [character-view.js](js/ui/character-view.js) with inline form and validation |
| 3. Users can edit and delete existing characters | Implemented in [character-view.js](js/ui/character-view.js) with inline edit form and delete confirmation |
| 4. Users can trigger an AI assistant to suggest a list of characters based on the Step 1 and 2 summaries | Implemented via "Generate with AI" button that calls [AIModal.launch('suggest-characters')](js/ui/ai-modal.js:189) |
| 5. All character data is saved to the Dexie database | Implemented in [db.js](js/db.js) with characters table and [store.js](js/store.js) with optimistic updates |
| 6. Existing Steps 1 & 2 functionality continues to work unchanged | Verified through testing - no changes to existing step functionality |
| 7. New functionality follows existing Lit component patterns | Implemented using LitElement in [character-view.js](js/ui/character-view.js) following existing patterns |
| 8. Integration with Dexie database maintains current behavior | Additive migration strategy preserves existing data and follows existing db patterns |
| 9. Change is covered by appropriate tests | Unit tests in [js/ui/tests/store-characters.test.js](js/ui/tests/store-characters.test.js) and [js/ui/tests/character-view.test.js](js/ui/tests/character-view.test.js) with ≥80% coverage |
| 10. Documentation is updated if needed | This document provides comprehensive documentation of the new features |
| 11. No regression in existing functionality verified | Manual QA checklist includes regression testing for existing steps |

## 1. Quick Project Assessment

**Current System Context:**

- [x] Relevant existing functionality identified: The application currently supports Snowflake Method steps 1 and 2.
- [x] Technology stack for this area noted: Lit, Zustand, Dexie, TailwindCSS.
- [x] Integration point(s) clearly understood: New "Characters" view in the sidebar, data saved to Dexie DB.
- [x] Existing patterns for similar work identified: Follow existing UI component patterns.

**Change Scope:**

- [x] Specific change clearly defined: Implement Step 3: Character Summaries.
- [x] Impact boundaries identified: New UI view, new DB table, new AI interaction.
- [x] Success criteria established: Defined in Acceptance Criteria.

## 2. Story Creation

#### Story Title

Implement Step 3: Character Summaries - Brownfield Addition

#### User Story

As a writer,
I want to create and manage a list of characters for my story,
So that I can begin to develop my cast.

#### Story Context

**Existing System Integration:**

- Integrates with: Existing sidebar navigation and Dexie database.
- Technology: Lit, Zustand, Dexie, TailwindCSS.
- Follows pattern: Existing UI component and state management patterns.
- Touch points: `project-sidebar.js`, `db.js`, `store.js`.

#### Acceptance Criteria

**Functional Requirements:**

1.  A new "Characters" view is available in the sidebar.
2.  Users can manually add a new character with a name and a summary.
3.  Users can edit and delete existing characters.
4.  Users can trigger an AI assistant to suggest a list of characters based on the Step 1 and 2 summaries.
5.  All character data is saved to the Dexie database.

**Integration Requirements:**

6. Existing Steps 1 & 2 functionality continues to work unchanged.
7. New functionality follows existing Lit component patterns.
8. Integration with Dexie database maintains current behavior.

**Quality Requirements:**

9. Change is covered by appropriate tests.
10. Documentation is updated if needed.
11. No regression in existing functionality verified.

#### Technical Notes

- **Integration Approach:** Add a new table to the Dexie database for characters. Add a new view component for character management.
- **Existing Pattern Reference:** Follow the patterns in `project-sidebar.js` for UI and `store.js` for state.
- **Key Constraints:** Must use the existing AI API proxy.

#### File List

- `js/db.js` (modified)
- `js/store.js` (modified)
- `js/ui/project-sidebar.js` (modified)
- `js/ui/character-view.js` (created)
- `index.html` (modified)
- `js/app-boot.js` (modified)
- `src/main.js` (modified)

## 3. Risk and Compatibility Check

**Minimal Risk Assessment:**

- **Primary Risk:** Database migration could fail.
- **Mitigation:** Implement a robust migration strategy with thorough testing.
- **Rollback:** Revert the application to its pre-update state.

**Compatibility Verification:**

- [x] No breaking changes to existing APIs.
- [x] Database changes (if any) are additive only.
- [x] UI changes follow existing design patterns.
- [x] Performance impact is negligible.

## 4. Validation Checklist

**Scope Validation:**

- [x] Story can be completed in one development session.
- [x] Integration approach is straightforward.
- [x] Follows existing patterns exactly.
- [x] No design or architecture work required.

**Clarity Check:**

- [x] Story requirements are unambiguous.
- [x] Integration points are clearly specified.
- [x] Success criteria are testable.
- [x] Rollback approach is simple.
