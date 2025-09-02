<!-- Powered by BMAD™ Core -->

# Create Brownfield Story Task

## 1. Quick Project Assessment

**Current System Context:**

- [x] Relevant existing functionality identified: The application currently supports Snowflake Method steps 1-6.
- [x] Technology stack for this area noted: Lit, Zustand, Dexie, TailwindCSS.
- [x] Integration point(s) clearly understood: New "Scenes" view, data saved to Dexie DB.
- [x] Existing patterns for similar work identified: Follow existing UI component patterns.

**Change Scope:**

- [x] Specific change clearly defined: Implement Steps 7 & 8: Scene List & Descriptions.
- [x] Impact boundaries identified: New UI view, new DB table, new AI interaction.
- [x] Success criteria established: Defined in Acceptance Criteria.

## 2. Story Creation

#### Story Title

Implement Steps 7 & 8: Scene List & Descriptions - Brownfield Addition

#### User Story

As a writer,
I want to create a re-orderable list of scenes and write detailed descriptions for each,
So that I can structure my story scene by scene.

#### Story Context

**Existing System Integration:**

- Integrates with: Existing sidebar navigation and Dexie database.
- Technology: Lit, Zustand, Dexie, TailwindCSS.
- Follows pattern: Existing UI component and state management patterns.
- Touch points: `project-sidebar.js`, `db.js`, `store.js`.

#### Acceptance Criteria

**Functional Requirements:**

1.  A new "Scenes" view is available in the sidebar.
2.  The view displays a re-orderable list of scenes.
3.  Each scene can be expanded to reveal a text editor for its description.
4.  Users can trigger an AI assistant to generate a scene list from the synopsis.
5.  Users can trigger an AI assistant to generate a description for a specific scene.
6.  All scene data (list order and descriptions) is saved to the Dexie database.

**Integration Requirements:**
7. Existing Steps 1-6 functionality continues to work unchanged.
8. New functionality follows existing Lit component patterns.
9. Integration with Dexie database maintains current behavior.

**Quality Requirements:**
10. Change is covered by appropriate tests.
11. Documentation is updated if needed.
12. No regression in existing functionality verified.

#### Technical Notes

- **Integration Approach:** Add a new table to the Dexie database for scenes. Add a new view component for the scene list and editor.
- **Existing Pattern Reference:** Follow the patterns in `project-sidebar.js` for UI and `store.js` for state.
- **Key Constraints:** Must use the existing AI API proxy.

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
