# 6. Epic: Implement Snowflake Method Steps 3-8

**Epic Goal**: To transform the Snowflake Method Writing Assistant into a complete story-planning tool by implementing all remaining steps (3-8), providing a seamless, AI-powered experience for writers.

**Integration Requirements**: All new features must integrate with the existing application structure, including the Lit-based component model, Zustand state management, Dexie database, and the OpenRouter API proxy.

---

### **Story 1.1: Implement Step 3: Character Summaries**
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

### **Story 1.2: Implement Step 4: Character Profiles**
*   **As a** writer,
*   **I want** to expand my character summaries into detailed, one-page profiles,
*   **so that** I can flesh out my characters' backstories and motivations.

**Acceptance Criteria**:
1.  Clicking on a character in the character list opens a detailed profile view.
2.  The profile view contains a large text area for the character's profile.
3.  Users can trigger an AI assistant to expand a character's summary into a full profile.
4.  All profile data is saved to the Dexie database, linked to the correct character.

---

### **Story 1.3: Implement Step 5: Multi-Page Synopsis**
*   **As a** writer,
*   **I want** to write a multi-page synopsis of my story,
*   **so that** I can connect my plot points and character arcs.

**Acceptance Criteria**:
1.  A new "Synopsis" view is available in the sidebar.
2.  The view contains a large text editor for the synopsis.
3.  Users can trigger an AI assistant to generate a synopsis based on the Step 2 summary and character summaries.
4.  The synopsis is saved to the Dexie database.

---

### **Story 1.4: Implement Step 6: Character Charts**
*   **As a** writer,
*   **I want** to create structured charts for my characters,
*   **so that** I can understand their goals, conflicts, and epiphanies at a glance.

**Acceptance Criteria**:
1.  A new "Character Charts" view is available, accessible from the character list.
2.  The view presents a form with fields for "Goal," "Conflict," "Motivation," "Epiphany," etc.
3.  Users can trigger an AI assistant to auto-fill the chart based on the character's profile and the synopsis.
4.  The chart data is saved to the Dexie database.

---

### **Story 1.5: Implement Steps 7 & 8: Scene List & Descriptions**
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
