# E2E Tests

End-to-end tests for the medical application using Playwright.

## Setup

```bash
pnpm install
npx playwright install
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in UI mode
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Run tests in debug mode
pnpm test:debug

# Run only auth tests
pnpm test:auth

# Show test report
pnpm report
```

## Test Configuration

Tests are configured to run against `http://localhost:3000` by default. You can override this with the `BASE_URL` environment variable:

```bash
BASE_URL=http://localhost:4000 pnpm test
```

## Writing Tests

Tests are located in the `tests/` directory. Each test file should follow the naming convention `*.spec.ts`.

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    // test logic
  });
});
```
