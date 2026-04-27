---
phase: 02-react-scaffold
plan: 01
type: auto
---

<objective>
Bootstrap the Vite + React 18 + TypeScript 5 project with complete dev tooling: ESLint, Prettier, Vitest, and path aliases. The project must run (`npm run dev`) and pass an empty test suite (`npm test`) before this plan is complete.

Purpose: Establish the buildable baseline that all subsequent plans depend on.
Output: Working React app at localhost:5173 with `npm run dev`; `npm test` passes with 0 tests.
</objective>

<context>
@.planning/PROJECT.md
@.planning/phases/01-migration-context/MIGRATION-CONTEXT.md
@.planning/codebase/STACK.md
</context>

<tasks>
  <task id="1" type="auto">
    Initialize Vite project: `npm create vite@latest . -- --template react-ts`
    Accept overwrite. Verify `package.json`, `vite.config.ts`, `tsconfig.json` created.
  </task>

  <task id="2" type="auto">
    Install dependencies:
    - Production: `react`, `react-dom` (already from template)
    - Dev: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
    Run: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`
  </task>

  <task id="3" type="auto">
    Configure Vitest in `vite.config.ts`:
    - Add `test: { globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`
    Create `src/test/setup.ts` with: `import '@testing-library/jest-dom'`
    Update `tsconfig.json` to include `"types": ["vitest/globals"]`
  </task>

  <task id="4" type="auto">
    Install and configure ESLint + Prettier:
    `npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks prettier eslint-config-prettier`
    Create `.eslintrc.json` with TypeScript + React hooks rules.
    Create `.prettierrc` with: `{ "semi": true, "singleQuote": true, "tabWidth": 2 }`
    Add scripts to `package.json`: `"lint": "eslint src --ext .ts,.tsx"`, `"format": "prettier --write src"`
  </task>

  <task id="5" type="auto">
    Add path alias `@` → `src/` in `vite.config.ts` and `tsconfig.json` (compilerOptions.paths).
    Add `npm install -D @types/node` for the `path` module in vite config.
  </task>

  <task id="6" type="auto">
    Clean template boilerplate: remove `src/App.css`, `src/assets/`, simplify `src/App.tsx` to render `<div>poc_dcs_fe</div>`.
    Update `src/main.tsx` to standard React 18 `createRoot` pattern.
  </task>

  <task id="7" type="auto">
    Verify: `npm run dev` starts without errors. `npm test` passes with 0 tests. `npm run lint` passes.
  </task>
</tasks>

<success_criteria>
- [ ] `npm run dev` starts at localhost:5173 without errors
- [ ] `npm test` passes (0 tests, no failures)
- [ ] `npm run lint` passes
- [ ] Path alias `@/` resolves to `src/`
- [ ] `src/test/setup.ts` imports jest-dom matchers
</success_criteria>
