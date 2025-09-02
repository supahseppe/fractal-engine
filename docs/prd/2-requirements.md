# 2. Requirements

## 2.1. Functional Requirements

*   **FR1**: The application shall provide a dedicated UI for managing a list of characters (Step 3), allowing users to add, edit, and delete characters.
*   **FR2**: The AI assistant shall be able to suggest a cast of characters based on the summaries from Steps 1 and 2.
*   **FR3**: The application shall provide a UI for viewing and editing detailed, one-page character profiles (Step 4), with AI assistance to expand summaries into full profiles.
*   **FR4**: The application shall provide a UI for creating a multi-page synopsis (Step 5), with AI assistance to generate the synopsis from the plot summary and character summaries.
*   **FR5**: The application shall provide a UI for creating structured character charts (Step 6), with AI assistance to auto-fill the chart from the character's profile and synopsis.
*   **FR6**: The application shall provide a UI for creating and managing a re-orderable list of scenes (Step 7), with AI assistance to generate the scene list from the synopsis.
*   **FR7**: Each scene in the list shall be expandable to a detailed scene description view (Step 8), with AI assistance to generate the description.

## 2.2. Non-Functional Requirements

*   **NFR1**: All new features must be implemented using the existing technology stack (Lit, Zustand, Dexie, TailwindCSS) and coding patterns.
*   **NFR2**: The application must maintain a consistent and intuitive user interface, adhering to the existing design system.
*   **NFR3**: Application performance must not noticeably degrade. UI responsiveness and data operations should remain fast.
*   **NFR4**: All user-generated data for the new steps must be reliably saved to the client-side database (IndexedDB via Dexie).
*   **NFR5**: The application must handle AI API errors gracefully, providing clear, user-friendly feedback without crashing.

## 2.3. Compatibility Requirements

*   **CR1: Data Compatibility**: Existing user data for Steps 1 and 2 must be preserved and remain fully accessible.
*   **CR2: Database Schema Compatibility**: The Dexie database schema must be updated in a backward-compatible manner. A clear migration path must be implemented if breaking changes are unavoidable.
*   **CR3: UI/UX Consistency**: New UI components must be visually and functionally consistent with the existing application to avoid a disjointed user experience.
*   **CR4: API Integration Compatibility**: All new AI features must use the existing `/api/openrouter` proxy and adhere to the current API communication patterns.
