# Kartoffel — Copilot Instructions

## Validation After Every Plan

After completing any implementation plan, always run these 4 commands in order and fix any issues before considering the task done:

```
npm run tsc
npm run lint
npm run test
npm run build
```

All 4 must exit with code 0. Fix errors before marking tasks complete.

## Project Structure

Monorepo with npm workspaces:

- `apps/kartoffel-web` — React web app (Vite + React Router)
- `packages/ui-library` — Shared component library (Storybook + Vitest browser tests via play functions)
- `packages/utils` — Shared utilities

## Test Conventions

- `ui-library` uses Storybook play functions for interaction tests (no `@testing-library/react` — not installed)
- `kartoffel-web` uses Vitest + jsdom + `@testing-library/react`
- Mock `@kartoffel/ui-library` in screen tests; test logic only, not UI rendering

## Architecture Notes

- No auth system — users are anonymous, identified by generated username stored in localStorage
- "Logout" = `clearUser()` (clears storage) + `window.location.replace('/')` (full reload ensures `RedirectIfUser` re-reads storage on re-mount)
- Route guards (`RequireUser` / `RedirectIfUser`) in `apps/kartoffel-web/src/router/index.tsx` are React components that read storage at render time — guards run on every navigation, not once at module load
