# Brownfield Enhancement PRD: Snowflake Method Steps 3-8

## 1. Intro Project Analysis and Context

### 1.1. Existing Project Overview

*   **Analysis Source**: IDE-based fresh analysis of the project files.
*   **Current Project State**: The project is the "Snowflake Method Writing Assistant," a web application that guides writers through the initial two steps of the Snowflake Method. It features an AI assistant to help with idea generation and refinement.

### 1.2. Available Documentation Analysis

The following documents have been analyzed to inform this PRD:
*   `SNOWFLAKE_METHOD.md`: Outlines the feature vision for all steps.
*   `memory-bank/app_overview.md`: Provides a technical overview of the current application.
*   `memory-bank/prd.md`: A user-created PRD for the remaining steps.

### 1.3. Enhancement Scope Definition

*   **Enhancement Type**:
    *   [x] New Feature Addition
    *   [x] Major Feature Modification
*   **Enhancement Description**: This enhancement will implement the remaining steps (3-8) of the Snowflake Method, covering character development, synopsis creation, and scene planning. This will complete the core functionality of the application.
*   **Impact Assessment**:
    *   [ ] Minimal Impact
    *   [ ] Moderate Impact
    *   [x] Significant Impact (substantial new code and modifications to existing structures will be required)
    *   [ ] Major Impact (architectural changes required)

### 1.4. Goals and Background Context

*   **Goals**:
    *   Implement all remaining steps of the Snowflake Method (3-8).
    *   Provide AI-powered assistance for each new step.
    *   Create a seamless and intuitive user experience for writers.
    *   Deliver a complete and robust story-planning tool.
*   **Background Context**: The current application is incomplete. This enhancement is necessary to fulfill the project's vision of providing a comprehensive tool for the entire Snowflake Method, solving the problem of writers needing to use multiple tools to plan their stories.

### 1.5. Change Log

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial PRD Draft | 2025-09-02 | 0.1 | Initial draft of the Brownfield Enhancement PRD for Snowflake Method steps 3-8. | John (PM) |

## 2. Requirements

### 2.1. Functional Requirements

*   **FR1**: The application shall provide a dedicated UI for managing a list of characters (Step 3), allowing users to add, edit, and delete characters.
*   **FR2**: The AI assistant shall be able to suggest a cast of characters based on the summaries from Steps 1 and 2.
*   **FR3**: The application shall provide a UI for viewing and editing detailed, one-page character profiles (Step 4), with AI assistance to expand summaries into full profiles.
*   **FR4**: The application shall provide a UI for creating a multi-page synopsis (Step 5), with AI assistance to generate the synopsis from the plot summary and character summaries.
*   **FR5**: The application shall provide a UI for creating structured character charts (Step 6), with AI assistance to auto-fill the chart from the character's profile and synopsis.
*   **FR6**: The application shall provide a UI for creating and managing a re-orderable list of scenes (Step 7), with AI assistance to generate the scene list from the synopsis.
*   **FR7**: Each scene in the list shall be expandable to a detailed scene description view (Step 8), with AI assistance to generate the description.

### 2.2. Non-Functional Requirements

*   **NFR1**: All new features must be implemented using the existing technology stack (Lit, Zustand, Dexie, TailwindCSS) and coding patterns.
*   **NFR2**: The application must maintain a consistent and intuitive user interface, adhering to the existing design system.
*   **NFR3**: Application performance must not noticeably degrade. UI responsiveness and data operations should remain fast.
*   **NFR4**: All user-generated data for the new steps must be reliably saved to the client-side database (IndexedDB via Dexie).
*   **NFR5**: The application must handle AI API errors gracefully, providing clear, user-friendly feedback without crashing.

### 2.3. Compatibility Requirements

*   **CR1: Data Compatibility**: Existing user data for Steps 1 and 2 must be preserved and remain fully accessible.
*   **CR2: Database Schema Compatibility**: The Dexie database schema must be updated in a backward-compatible manner. A clear migration path must be implemented if breaking changes are unavoidable.
*   **CR3: UI/UX Consistency**: New UI components must be visually and functionally consistent with the existing application to avoid a disjointed user experience.
*   **CR4: API Integration Compatibility**: All new AI features must use the existing `/api/openrouter` proxy and adhere to the current API communication patterns.

## 3. User Interface Enhancement Goals

### 3.1. Integration with Existing UI

New UI elements will be implemented as Lit web components, following the precedent set by `project-sidebar.js` and `ai-modal.js`. The existing TailwindCSS configuration and design tokens (colors, fonts, spacing) will be strictly used to ensure a cohesive look and feel. Navigation between the new steps will be integrated into the existing `project-sidebar`, providing a single, consistent place for users to move through their writing process.

### 3.2. Modified/New Screens and Views

*   **Character Management View (Steps 3 & 4)**: A new view to display the character list. This view will allow users to add, edit, and delete characters, and to open a detailed profile editor for each one.
*   **Synopsis Editor (Step 5)**: A dedicated, large-pane editor for writing the multi-page synopsis.
*   **Character Chart View (Step 6)**: A new view that presents the character chart as a structured form with clearly defined fields.
*   **Scene List & Editor (Steps 7 & 8)**: A new view for the re-orderable scene list. Each scene will be an expandable item that reveals a rich text editor for the detailed scene description.

### 3.3. UI Consistency Requirements

*   All new interactive elements (buttons, text areas, modals) will reuse the existing styles and behaviors to ensure a predictable user experience.
*   The existing loading and notification patterns (e.g., the "Progress saved!" notification and button loading spinners) will be implemented for all new asynchronous actions.
*   The `ai-modal` component will be used to display all AI-generated content, maintaining a consistent interaction pattern for AI assistance across the entire application.

## 4. Technical Constraints and Integration Requirements

### 4.1. Existing Technology Stack

The enhancement will be built using the project's established technology stack:
*   **Languages**: JavaScript (ESM)
*   **Frameworks/Libraries**: Lit (for web components), Vite (build tool)
*   **Database**: Dexie.js (as an IndexedDB wrapper)
*   **Styling**: TailwindCSS
*   **State Management**: Zustand
*   **External Dependencies**: `marked` (for markdown rendering)

### 4.2. Integration Approach

*   **Database Integration Strategy**: New tables for characters, profiles, charts, and scenes will be added to the existing `SnowflakeProject` Dexie database. The database version will be incremented, and a schema migration will be implemented to preserve existing user data.
*   **API Integration Strategy**: All new AI features will use the existing `/api/openrouter` proxy. New prompt-generation logic will be added to `js/api.js` to support the new AI capabilities.
*   **Frontend Integration Strategy**: New features will be implemented as Lit components, placed in the `js/ui/` directory. The main application bootstrap file, `js/app-boot.js`, will be extended to manage the new views and event listeners. The Zustand store in `js/store.js` will be updated to manage the state for the new steps.

### 4.3. Code Organization and Standards

*   **File Structure Approach**: New UI components will reside in `js/ui/`. State management will be centralized in `js/store.js`, and API logic in `js/api.js`.
*   **Naming Conventions**: Existing naming conventions (e.g., kebab-case for filenames, PascalCase for Lit component classes) will be strictly followed.
*   **Coding Standards**: The existing coding style, including the use of ES modules and async/await, will be maintained. New code should be commented where the logic is complex.

### 4.4. Risk Assessment and Mitigation

*   **Technical Risks**:
    *   **Database Migration Failure**: A failure in the Dexie migration could lead to data loss for existing users.
        *   **Mitigation**: Implement a robust migration strategy with thorough testing. Advise users to use the "Quick Save" feature to back up their data before any update.
    *   **State Management Complexity**: The Zustand store could become difficult to manage as more state is added for the new steps.
        *   **Mitigation**: Organize the Zustand store into logical slices for different features to manage complexity and improve maintainability.
*   **Integration Risks**:
    *   **Inconsistent UI**: New UI components could diverge from the existing design, creating a disjointed experience.
        *   **Mitigation**: Create a shared style guide or document of common component patterns to ensure all new UI elements are consistent with the established design system.

## 5. Epic and Story Structure

### 5.1. Epic Approach

**Epic Structure Decision**: This enhancement will be structured as a **single, comprehensive epic**.

**Rationale**: The work to implement steps 3-8 of the Snowflake Method is highly sequential and interconnected. Each step builds directly on the previous one. Managing this as a single epic will ensure that the development process is holistic, considering the entire user journey from character creation to scene planning. This approach avoids the risk of creating disconnected features and ensures a smooth, integrated final product.

## 6. Epic: Implement Snowflake Method Steps 3-8

**Epic Goal**: To transform the Snowflake Method Writing Assistant into a complete story-planning tool by implementing all remaining steps (3-8), providing a seamless, AI-powered experience for writers.

**Integration Requirements**: All new features must integrate with the existing application structure, including the Lit-based component model, Zustand state management, Dexie database, and the OpenRouter API proxy.

---

#### **Story 1.1: Implement Step 3: Character Summaries**
*   **As a** writer,
*   **I want** to create and manage a list of characters for my story,
*   **so that** I can begin to develop my cast.

**Acceptance Criteria**:
1.  A new "Characters" view is available in the sidebar.
2.  Users can manually add a new character with a name and a summary.
3.  Users can edit and delete existing characters.
4.  Users can trigger an AI assistant to suggest a list of characters based on the Step 1 and 2 summaries.
5.  All character data is saved to the Dexie database.

---

#### **Story 1.2: Implement Step 4: Character Profiles**
*   **As a** writer,
*   **I want** to expand my character summaries into detailed, one-page profiles,
*   **so that** I can flesh out my characters' backstories and motivations.

**Acceptance Criteria**:
1.  Clicking on a character in the character list opens a detailed profile view.
2.  The profile view contains a large text area for the character's profile.
3.  Users can trigger an AI assistant to expand a character's summary into a full profile.
4.  All profile data is saved to the Dexie database, linked to the correct character.

---

#### **Story 1.3: Implement Step 5: Multi-Page Synopsis**
*   **As a** writer,
*   **I want** to write a multi-page synopsis of my story,
*   **so that** I can connect my plot points and character arcs.

**Acceptance Criteria**:
1.  A new "Synopsis" view is available in the sidebar.
2.  The view contains a large text editor for the synopsis.
3.  Users can trigger an AI assistant to generate a synopsis based on the Step 2 summary and character summaries.
4.  The synopsis is saved to the Dexie database.

---

#### **Story 1.4: Implement Step 6: Character Charts**
*   **As a** writer,
*   **I want** to create structured charts for my characters,
*   **so that** I can understand their goals, conflicts, and epiphanies at a glance.

**Acceptance Criteria**:
1.  A new "Character Charts" view is available, accessible from the character list.
2.  The view presents a form with fields for "Goal," "Conflict," "Motivation," "Epiphany," etc.
3.  Users can trigger an AI assistant to auto-fill the chart based on the character's profile and the synopsis.
4.  The chart data is saved to the Dexie database.

---

#### **Story 1.5: Implement Steps 7 & 8: Scene List & Descriptions**
*   **As a** writer,
*   **I want** to create a re-orderable list of scenes and write detailed descriptions for each,
*   **so that** I can structure my story scene by scene.

**Acceptance Criteria**:
1.  A new "Scenes" view is available in the sidebar.
2.  The view displays a re-orderable list of scenes.
3.  Each scene can be expanded to reveal a text editor for its description.
4.  Users can trigger an AI assistant to generate a scene list from the synopsis.
5.  Users can trigger an AI assistant to generate a description for a specific scene.
6.  All scene data (list order and descriptions) is saved to the Dexie database.

## 7. QA Plan

### 7.1. Testing Strategy

*   **Overall Strategy**: The testing strategy will employ a mix of manual and automated testing. Manual testing will focus on user experience and exploratory testing, while automated tests will cover critical component logic and state management.
*   **Regression Testing Scope**: After the implementation of each new user story, a full manual regression test of all previously existing functionality (Steps 1 and 2) will be performed. This is to ensure that the core features of the application remain stable and bug-free.
*   **Integration Testing Scope**: Integration testing will focus on the data flow between the new UI components, the Zustand store, the Dexie database, and the AI API. Key integration points, such as the AI using data from previous steps, will be a primary focus.
*   **New Feature Testing**: Each new feature will be manually tested against all of its acceptance criteria in a development environment.

### 7.2. Test Cases

Here are some high-level examples of the test cases that will be executed:

*   **TC1: New Feature - Character Creation (Story 1.1)**
    *   Verify that a user can successfully add, edit, and delete a character.
    *   Verify that the AI character suggestion feature returns a list of characters in the correct format.
    *   Verify that all character data is correctly persisted in the Dexie database and reloaded on a page refresh.
*   **TC2: Regression - Step 1 & 2 Functionality**
    *   Verify that a user can still create, edit, and save the one-sentence and one-paragraph summaries.
    *   Verify that the AI suggestion, brainstorm, and refine features for Steps 1 and 2 continue to work as expected.
    *   Verify that no existing data for Steps 1 and 2 is lost or corrupted after the new features are added.
*   **TC3: Integration - Synopsis Generation (Story 1.3)**
    *   Verify that the AI synopsis generation feature correctly pulls and uses the data from the Step 2 summary and the character summaries from Step 3.
    *   Verify that the generated synopsis is correctly displayed in the UI and can be edited by the user.
    *   Verify that the final synopsis is saved correctly to the database and is persistent.

## 8. Deployment Plan

### 8.1. Pre-Deployment Steps

1.  **User Backup Recommendation**: Before the deployment, release notes will be published advising users to use the "Quick Save" feature. This will create a `localStorage` backup of their project, safeguarding their work against any unforeseen issues with the database migration.
2.  **Final Build Verification**: A final production build (`npm run build`) will be created and deployed to a staging environment. A full regression and new feature test will be performed on this build to ensure it is stable.

### 8.2. Deployment Steps

1.  **Deploy Production Build**: The contents of the verified `dist` directory will be deployed to the production static web host, replacing the previous version.
2.  **Production Verification**: After deployment, a smoke test will be performed in the live environment to verify that the application loads and core features are functional.

### 8.3. Rollback Plan

1.  **Rollback Trigger**: A rollback will be triggered if any critical, user-impacting issues are identified in production that were not caught during testing. This includes, but is not limited to, data corruption, failure of the database migration, or critical bugs in the core functionality of any step.
2.  **Rollback Procedure**: The previous stable version of the `dist` directory will be immediately redeployed to the production web host, effectively reverting the application to its pre-update state.

## 9. Post-Deployment

### 9.1. Monitoring and Verification

1.  **Monitoring Metrics**: The primary metric for a successful deployment will be the absence of user-reported bugs related to the new features or regressions in existing functionality. We will monitor community channels (if any) and user feedback for any issue reports.
2.  **Log Verification**: We will perform spot-checks by monitoring the browser's developer console in the live environment to ensure there are no unexpected errors or warnings being logged during application use.

### 9.2. Stakeholder Communication

*   **Communication Plan**: A set of release notes will be published to announce the new features and improvements. This will inform users of the new capabilities and guide them on how to use them.
*   **Key Messages**: The communication will celebrate the completion of the core Snowflake Method workflow, highlighting that the application is now a comprehensive tool for story planning from start to finish.
*   **Channels**: The release notes will be accessible via a link within the application (e.g., a "What's New" modal on first launch after the update) and on the project's website or code repository.
*   **Timeline**: The release notes will be published simultaneously with the deployment.
