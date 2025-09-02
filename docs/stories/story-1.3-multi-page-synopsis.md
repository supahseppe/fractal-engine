<!-- Powered by BMAD™ Core -->

# Create Brownfield Story Task

## 1. Quick Project Assessment

**Current System Context:**

- [x] Relevant existing functionality identified: The application currently supports Snowflake Method steps 1-4.
- [x] Technology stack for this area noted: Lit, Zustand, Dexie, TailwindCSS.
- [x] Integration point(s) clearly understood: New "Synopsis" view, data saved to Dexie DB.
- [x] Existing patterns for similar work identified: Follow existing UI component patterns.

**Change Scope:**

- [x] Specific change clearly defined: Implement Step 5: Multi-Page Synopsis.
- [x] Impact boundaries identified: New UI view, new DB table, new AI interaction.
- [x] Success criteria established: Defined in Acceptance Criteria.

## 2. Story Creation

#### Story Title

Implement Step 5: Multi-Page Synopsis - Brownfield Addition

#### User Story

As a writer,
I want to write a multi-page synopsis of my story,
So that I can connect my plot points and character arcs.

#### Story Context

**Existing System Integration:**

- Integrates with: Existing sidebar navigation and Dexie database.
- Technology: Lit, Zustand, Dexie, TailwindCSS.
- Follows pattern: Existing UI component and state management patterns.
- Touch points: `project-sidebar.js`, `db.js`, `store.js`.

#### Acceptance Criteria

**Functional Requirements:**

1.  A new "Synopsis" view is available in the sidebar.
2.  The view contains a large text editor for the synopsis.
3.  Users can trigger an AI assistant to generate a synopsis based on the Step 2 summary and character summaries.
4.  The synopsis is saved to the Dexie database.

**Integration Requirements:**
5. Existing Steps 1-4 functionality continues to work unchanged.
6. New functionality follows existing Lit component patterns.
7. Integration with Dexie database maintains current behavior.

**Quality Requirements:**
8. Change is covered by appropriate tests.
9. Documentation is updated if needed.
10. No regression in existing functionality verified.

#### Technical Notes

- **Integration Approach:** Add a new table to the Dexie database for the synopsis. Add a new view component for the synopsis editor.
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
