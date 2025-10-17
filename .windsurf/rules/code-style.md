---
trigger: always_on
---

# TypeScript Coding Style Guidelines

## 1. Type Definitions

- Use TypeScript's static typing system to its full potential
- Prefer explicit type annotations for function parameters and return types
- Use `type` for simple type definitions and `interface` for extendable object shapes
- Use type aliases to create meaningful, reusable type definitions
- Prefer `unknown` over `any` when the type is truly unknown
- Use `void` for functions that don't return a value
- Use union types (`|`) for variables that can be multiple types
- Use intersection types (`&`) to combine types

```typescript
// Prefer this
function processData(input: string): number {
  return parseInt(input, 10);
}

// Over this
function processData(input) {
  return parseInt(input, 10);
}
```

## 2. Naming Conventions

- Use PascalCase for type names, interfaces, classes, and enums
- Use camelCase for variables, functions, and class members
- Use UPPER_CASE for constants and static readonly properties
- Don't prefix interfaces with `I`, use a more explicit naming for them
- Prefix private properties with # to fully utilise modern JS
- Use descriptive names that convey meaning and purpose

```typescript
// Types and interfaces
interface UserProfile {
  id: string;
  displayName: string;
}

// Variables and functions
const maxRetryCount = 3;
function calculateTotalScore(scores: number[]): number {
  // implementation
}

// Constants
const API_BASE_URL = "https://api.example.com";
```

## 3. Component Structure

- Don't import React's default import as it's not needed
- Use functional components with hooks instead of class components
- Define component props using TypeScript interfaces or types
- Use type imports for React types: `import type { ReactElement } from 'react'`
- Destructure props in function parameters
- Provide default values for optional props in the destructuring whenever possible
- Don't use default exports

```tsx
import type { ReactElement } from "react";

type ButtonProps = {
  children: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## 4. Imports and Exports

- Use named exports always
- Never use default exports
- Order imports by source: built-in modules, external dependencies, internal modules
- Use absolute imports for modules outside the current directory
- Use relative imports for modules within the same directory or subdirectories
- Use type imports for type-only imports: `import type { Something } from './somewhere'`
- Avoid re-exporting
- DO NOT use star exports or imports unless mandatory
- ALWAYS add exactly one blank line between import statements and the rest of the file.

```typescript
import { type ReactElement, useState, useEffect } from "react";
import type { User } from "@mazeapp/frontend-core/types";
import { formatDate } from "~/utils/date";
import { Button } from "~/componnts/Button";
import { SubComponent } from "./components/SubComponent";
```

## 5. Functions

- Prefer arrow functions for consistency and lexical `this` binding
- Use function declarations for named functions at the top level
- Use explicit return types for functions
- Use parameter destructuring for objects
- Provide default values for optional parameters
- Keep functions small and focused on a single responsibility

```typescript
// Arrow function with explicit return type
const calculateTotal = (prices: number[]): number => {
  return prices.reduce((sum, price) => sum + price, 0);
};

// Function with parameter destructuring and defaults
function fetchData({
  url,
  method = "GET",
  headers = {},
}: {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
}): Promise<Response> {
  return fetch(url, { method, headers });
}
```

## 6. Error Handling

- Use typed error handling with custom error classes
- Avoid throwing generic errors
- Use try/catch blocks for error handling
- Provide meaningful error messages
- Consider using Result types for functions that can fail

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch user: ${response.statusText}`,
        response.status
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API error
    }
    throw error;
  }
}
```

## 7. Null and Undefined

- Use `undefined` for uninitialized values
- Use `null` only when explicitly required by an API
- Use optional chaining (`?.`) for potentially undefined properties
- Use nullish coalescing (`??`) for default values and prefer it over `||`
- Use non-null assertion (`!`) only when you're absolutely certain a value isn't null,
  - Prefer to write and use type guard functions where possible

```typescript
// Optional chaining
const userName = user?.profile?.displayName;

// Nullish coalescing
const count = data?.count ?? 0;
```

## 8. Async Code

- Use `async/await` instead of Promise chains
- Properly type Promise return values
- Handle errors in async functions with try/catch
- Avoid unnecessary Promise creation

```typescript
async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
```

## 9. Code Organization

- Group related functionality in modules
- Do not use barrel files (index.ts) to re-export files
- Keep files small and focused on a single responsibility
- Use consistent directory structure
- Separate business logic from UI components

## 10. Testing

- Write unit tests for all business logic
- Use TypeScript in test files
- Mock dependencies for isolated testing
- Test edge cases and error scenarios
- Use descriptive test names

## 11. Linting and Formatting

- Use [Biome](mdc:biome.json) for linting and formatting
- Follow the configured rules in biome.json
- Use consistent indentation (2 spaces)
- Use consistent line endings (LF)
- Keep line length reasonable (80-120 characters)
- Use semicolons at the end of statements
- Use single quotes for strings
- Always fix all Biome errors and warnings

### Biome Configuration

- Extend from `@mazeapp/biome-config/biome`
- Use organize imports feature
- Follow configured overrides for specific packages
- Respect file ignore patterns

### Linting Rules

1. A11y:
   - Ensure SVG elements have titles
   - Use valid anchor elements
   - Handle click and mouse events with keyboard events
   - Provide iframe titles

2. Correctness:
   - Use exhaustive dependencies in hooks
   - Avoid switch declarations
   - Use keys in iterables
   - Handle precision loss

3. Complexity:
   - Use optional chaining
   - Avoid useless switch cases
   - Use arrow functions
   - Remove useless fragments

4. Style:
   - Use import type statements
   - Follow parameter ordering
   - Use Node.js import protocol
   - Use enum initializers

### Formatting

1. Code Organization:
   - Group related functionality
   - Keep files focused and small
   - Use consistent directory structure
   - Separate business logic from UI

2. Import Organization:
   - Group imports by type
   - Sort imports automatically
   - Remove unused imports
   - Use proper import aliases

## 12. Advanced TypeScript Features

- Use generics for reusable components and functions
- Use mapped types to transform existing types
- Use conditional types for type-level logic
- Use utility types (Partial, Required, Pick, Omit, etc.)
- Use const assertions for literal types
- Prefer to use modern Object.prototype.groupBy, Object.prototype.entries over manual for loops
- Prefer to use Set.prototype.difference for a difference between two lists
- Prefer to use Set.prototype.union for a union of two lists
- Prefer to use Set.prototype.intersection for an intersection of two lists

```typescript
// Generic function
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Mapped type
type ReadonlyProps<T> = {
  readonly [K in keyof T]: T[K];
};

// Utility types
type UserProfileUpdate = Partial<UserProfile>;
type UserProfileRequired = Required<UserProfile>;
```

## 13. Performance Considerations

- Use React.memo for component memoization
- Use useMemo and useCallback hooks for expensive calculations and callbacks
- Avoid unnecessary re-renders
- Use proper dependency arrays in hooks
- Consider code splitting for large applications

```tsx
import { useMemo, useCallback } from "react";

const ExpensiveComponent = React.memo(({ data, onAction }: Props) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  const handleAction = useCallback(() => {
    onAction(data.id);
  }, [onAction, data.id]);

  return (
    <div onClick={handleAction}>
      {processedData.map((item) => (
        <Item key={item.id} {...item} />
      ))}
    </div>
  );
});
```
