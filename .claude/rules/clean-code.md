# Clean Code Principles

## Single Responsibility
- Each function does ONE thing well
- Each class/module has ONE reason to change
- If you can't name it clearly, it's doing too much
- Max function length: ~20 lines; split if longer

## DRY (Don't Repeat Yourself)
- Extract repeated logic into shared functions/utilities
- But don't over-abstract — duplication is cheaper than the wrong abstraction
- Rule of three: refactor on the third occurrence, not the first

## KISS (Keep It Simple)
- Simplest solution that works correctly
- No premature optimization — measure first
- No speculative generality — build for today's requirements
- Flat is better than nested: avoid deep nesting (max 2-3 levels)

## Clean Functions
- Descriptive verb-based names: `calculateTotal`, `fetchUser`, `validateInput`
- Minimal parameters (ideally 0-2; use object param for 3+)
- No side effects unless the function name implies them
- No flag arguments — split into separate functions instead
- Pure functions where possible: same input → same output

## Clean Conditionals
- Positive conditions first: `if (isValid)` not `if (!isInvalid)`
- Extract complex conditions into named booleans or functions:
  ```typescript
  // ❌
  if (user.age >= 18 && user.subscription === 'premium' && !user.isBanned) { ... }

  // ✅
  const canAccessContent = user.age >= 18 && user.subscription === 'premium' && !user.isBanned;
  if (canAccessContent) { ... }
  ```
- Guard clauses (early returns) over nested if/else
- No else after return/throw/continue

## Error Handling
- Handle errors at the appropriate level — don't swallow silently
- Throw specific, descriptive errors with context
- Don't use exceptions for control flow
- Validate at boundaries (user input, API responses), trust internal code

## Code Smells to Avoid
- **God objects/functions** — break into smaller pieces
- **Dead code** — delete it; git has history
- **Commented-out code** — delete it; git has history
- **Inconsistent abstractions** — keep sibling functions at the same level of detail
- **Feature envy** — if a function uses another module's data more than its own, move it
- **Primitive obsession** — use domain types instead of raw strings/numbers for business concepts

## Readability
- Code is read 10x more than written — optimize for the reader
- Vertical spacing: group related lines, blank line between logical sections
- Consistent patterns within a file and across the codebase
- Meaningful diffs: format changes and logic changes in separate commits

## Dependencies
- Minimize external dependencies — each one is a liability
- Wrap third-party APIs behind your own interface when used in multiple places
- Keep dependency injection explicit and testable

## Testing Mindset
- Write code that is easy to test: pure functions, dependency injection, clear interfaces
- If something is hard to test, the design likely needs improvement
- Test behavior, not implementation details
