# 3. User Interface Enhancement Goals

## 3.1. Integration with Existing UI

New UI elements will be implemented as Lit web components, following the precedent set by `project-sidebar.js` and `ai-modal.js`. The existing TailwindCSS configuration and design tokens (colors, fonts, spacing) will be strictly used to ensure a cohesive look and feel. Navigation between the new steps will be integrated into the existing `project-sidebar`, providing a single, consistent place for users to move through their writing process.

## 3.2. Modified/New Screens and Views

*   **Character Management View (Steps 3 & 4)**: A new view to display the character list. This view will allow users to add, edit, and delete characters, and to open a detailed profile editor for each one.
*   **Synopsis Editor (Step 5)**: A dedicated, large-pane editor for writing the multi-page synopsis.
*   **Character Chart View (Step 6)**: A new view that presents the character chart as a structured form with clearly defined fields.
*   **Scene List & Editor (Steps 7 & 8)**: A new view for the re-orderable scene list. Each scene will be an expandable item that reveals a rich text editor for the detailed scene description.

## 3.3. UI Consistency Requirements

*   All new interactive elements (buttons, text areas, modals) will reuse the existing styles and behaviors to ensure a predictable user experience.
*   The existing loading and notification patterns (e.g., the "Progress saved!" notification and button loading spinners) will be implemented for all new asynchronous actions.
*   The `ai-modal` component will be used to display all AI-generated content, maintaining a consistent interaction pattern for AI assistance across the entire application.
