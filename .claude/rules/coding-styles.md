# TypeScript Coding Style Guidelines

## Naming

- PascalCase: classes, types, interfaces, enums
- camelCase: variables, functions, methods
- kebab-case: file and directory names
- UPPER_CASE: constants, environment variables
- Boolean vars: `isX`, `hasX`, `canX`; functions start with a verb
- No `I` prefix on interfaces. Use complete words (except: API, URL, i/j, err, ctx, req/res/next)

## Types

- Always declare types for variables, function params, and return values
- Avoid `any` — prefer `unknown`
- `type` for simple definitions, `interface` for extendable object shapes
- `readonly` for immutable data, `as const` for literal constants
- Prefer `undefined` over `null`; use `?.` and `??` (not `||`)

## Imports & Exports

- Named exports only — NEVER default exports
- `import type { ... }` for type-only imports
- No star imports/exports, no barrel files (index.ts re-exports)
- One blank line between imports and code
- Order: built-in, external deps, internal modules
- Use path aliases (`@/...`) when configured

## Functions

- Prefer arrow functions; short single-purpose functions (< 20 instructions)
- Early returns to avoid nesting; extract to utility functions
- Default parameter values instead of null checks
- RO-RO pattern for multiple parameters

## Constants

- Extract magic numbers to named UPPER_CASE constants with units: `TIMEOUT_MS = 5000`
- Keep inline: array indices, loop incrementors, HTTP status codes, single-use obvious values

## Date Operations

Always use `date-fns` for date manipulation. Never native Date math.

```typescript
import { startOfMonth, addDays, format, isAfter } from 'date-fns';
```

## Comments

- Self-documenting code first; comments only for non-obvious logic
- JSDoc for public/exported APIs, controller/service methods, complex types
- Good: business rules, workarounds, external constraints, TODO/FIXME
- Bad: restating what code does, obvious explanations
- English only

## Strings

- Never refactor string quotes unless fixing syntax errors or explicitly asked
- Match existing file style; minimize diffs

## Performance (React)

- Use `React.memo`, `useMemo`, `useCallback` where beneficial
- Functional components with hooks only (no class components)
- Proper dependency arrays in hooks

## Modern APIs

- Prefer `Object.groupBy`, `Set.prototype.difference/union/intersection`
- `async/await` over Promise chains
