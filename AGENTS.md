# Repository Guidelines

## Project Structure & Module Organization
- Root: `index.html` (app), `demo.html` (legacy demo), `serve.sh` (local server).
- Source: `js/` (vanilla ES modules) and `js/ui/` (Lit web components).
  - Core: `app.js` (bootstraps UI), `api.js` (Gemini calls), `db.js` (Dexie/IndexedDB), `store.js` (Zustand state).
  - UI: `ai-modal.js`, `suggestion-card.js`, `project-sidebar.js`.
- Tooling: Vite dev server/build; Tailwind via PostCSS; local deps for Lit, Zustand, Dexie, Marked.

## Build, Test, and Development Commands
- Dev server: `npm run dev` (Vite at `http://localhost:8675`).
- Build: `npm run build` (outputs to `dist/`).
- Preview build: `npm run preview`.
- Optional helper: `bash serve.sh` installs deps and runs Vite.

## Coding Style & Naming Conventions
- JavaScript: ES modules with named exports; keep files small and focused.
- Components: file names in kebab-case (e.g., `ai-modal.js`); class names in PascalCase (e.g., `AIModal`).
- Indentation: 2 spaces preferred; match nearby code when editing.
- CSS: prefer Tailwind utility classes in HTML; component-specific styles live inside Lit components.
- Naming: DOM ids use `step-*` pattern; events are lower-kebab (e.g., `apply`, `iterate`).

## Testing Guidelines
- Framework: none configured. For now, rely on manual checks:
  - Loads without console errors.
  - Step navigation updates view and state (Zustand).
  - Persistence works (Dexie stores `steps`).
  - AI actions open modal and render results; error states are visible.
- Future: consider Playwright for UI flows and a lightweight mock for the Gemini API.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat: add synthesize flow`, `fix: handle empty AI response`).
- PRs: include concise description, before/after screenshots for UI, reproduction/validation steps, and reference related issues.
- Keep diffs focused; update docs when changing UX or commands.

## Security & Configuration Tips
- Do not hardcode API keys. Move Gemini calls behind a small proxy or inject keys at runtime via server-side config. Never commit secrets.
- Be mindful of CORS when introducing a proxy. Validate inputs before sending to external APIs.
