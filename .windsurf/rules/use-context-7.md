---
trigger: model_decision
description: Always use Context7 MCP for up-to-date library documentation and API references
---

# Always Use Context7 for Libraries and Specs

Always refer to Context7 MCP when it is available, and when referencing any library, framework, API, or technical specification.

## The Problem

Agents often rely on outdated or incomplete knowledge when referencing:

- Library APIs and documentation
- Framework usage patterns
- Technical specifications
- Best practices for specific tools
- Version-specific features and changes

This leads to:

- Incorrect usage examples
- Outdated recommendations
- Missing new features or patterns
- Deprecated API usage
- Inconsistent information

## The Solution

**Always use Context7 MCP when available** to get up-to-date, accurate information about libraries, frameworks, and specifications.

## When to Use Context7

Use Context7 for any reference to:

### 1. JavaScript/TypeScript Libraries

```typescript
// Examples requiring Context7 lookup:
- React and React hooks
- Next.js routing and API patterns
- Apollo Client usage
- Prisma query patterns
- Express.js middleware
- Jest testing patterns
- Playwright automation
```

### 2. Framework Documentation

```typescript
// Examples requiring Context7 lookup:
- Next.js app directory structure
- React Server Components
- Node.js latest features
- TypeScript utility types
- GraphQL schema patterns
```

### 3. API Specifications

```typescript
// Examples requiring Context7 lookup:
- RESTful API design patterns
- GraphQL specification
- OpenAPI/Swagger definitions
- WebSocket protocols
- HTTP status codes and usage
```

### 4. Development Tools

```typescript
// Examples requiring Context7 lookup:
- ESLint configuration patterns
- Prettier formatting rules
- Webpack/Vite configuration
- Docker best practices
- CI/CD pipeline patterns
- Cursor rule creation (.cursor/rules/rule-name.mdc)
```

## Implementation Guidelines

### Before Providing Library Guidance

**Always check Context7 first:**

1. **Identify the library/spec** being referenced
2. **Use resolve-library-id** to find the correct Context7 ID
3. **Use get-library-docs** with specific topics
4. **Provide accurate, up-to-date information** based on Context7 results

### Context7 Workflow

```typescript
// 1. Resolve the library ID
await resolveLibraryId(libraryName);

// 2. Get specific documentation
await getLibraryDocs({
  context7CompatibleLibraryID: resolvedId,
  topic: specificTopic,
  tokens: appropriateAmount,
});

// 3. Provide guidance based on current documentation
```

## Common Scenarios

### Scenario 1: React Usage Questions

```typescript
// ✅ Correct approach:
// 1. Use Context7 to get current React documentation
// 2. Reference latest hooks patterns
// 3. Provide version-appropriate examples

// ❌ Incorrect approach:
// 1. Use potentially outdated knowledge
// 2. Miss recent React features
// 3. Provide deprecated patterns
```

### Scenario 2: Framework Best Practices

```typescript
// ✅ For Next.js questions:
// 1. Use Context7 to get Next.js documentation
// 2. Check for latest app directory patterns
// 3. Reference current deployment practices

// ❌ Without Context7:
// 1. Reference old pages directory patterns
// 2. Miss app directory features
// 3. Provide outdated optimization tips
```

### Scenario 3: API Integration

```typescript
// ✅ For library integration:
// 1. Use Context7 to get latest API documentation
// 2. Reference current authentication patterns
// 3. Provide accurate configuration examples

// ❌ Without Context7:
// 1. Use outdated API endpoints
// 2. Reference deprecated auth methods
// 3. Provide incorrect configuration
```

## Error Prevention

### Detection Strategy

Before answering questions about:

- Any named library or framework
- Technical specifications or standards
- API usage patterns
- Configuration examples

**Check if Context7 is available in your tools.**

### Fallback Handling

If Context7 isn't available:

```typescript
// ✅ Good approach:
"I don't have access to Context7 in this session, so I'll provide guidance based on my training data. Please verify this information with the latest documentation as it may be outdated.";

// ❌ Avoid:
// Providing potentially outdated information without disclaimer
```

## Best Practices

### Topic-Specific Searches

Use focused Context7 queries:

```typescript
// ✅ Specific topic searches:
topic: "hooks and state management";
topic: "routing and navigation";
topic: "authentication patterns";
topic: "testing utilities";

// ❌ Generic searches:
topic: "everything about React";
```

### Token Management

The `get-library-docs` function has a `tokens` parameter that controls how much documentation Context7 retrieves. More tokens = more comprehensive documentation, but also higher API costs and slower response times.

Adjust token limits based on your specific need:

```typescript
// For quick API reference (function signatures, basic usage):
tokens: 5000;
// Example: "How do I import useState from React?"
// Example: "What's the syntax for a basic fetch request?"

// For comprehensive guides (detailed explanations, best practices):
tokens: 15000;
// Example: "How do I implement authentication with Next.js?"
// Example: "What are the best practices for Apollo Client setup?"

// For specific implementation details (moderate detail for features):
tokens: 10000;
// Example: "How do I configure Prettier with specific rules?"
// Example: "What's the proper way to handle errors in React Query?"
```

Choose the appropriate token amount to balance information quality with efficiency and cost.

### Information Synthesis

When using Context7:

1. **Extract relevant information** for the specific question
2. **Adapt examples** to the user's context
3. **Reference version information** when relevant
4. **Provide links** to original documentation when helpful

## Integration with Other Rules

This rule complements:

- **Memory before searching**: Check memory first, then Context7, then codebase
- **Build packages**: Context7 might have build dependency information
- **Import consumption**: Context7 can show proper import patterns

## Quality Assurance

When using Context7 results:

### Verify Relevance

- Ensure the documentation matches the user's question
- Check that examples apply to their use case
- Confirm version compatibility when relevant

### Provide Complete Answers

- Include necessary imports and setup
- Show complete, working examples
- Reference related concepts when helpful

### Stay Current

- Use Context7 to get the most recent information
- Reference latest best practices
- Avoid deprecated patterns

## Communication

When using Context7:

- **Mention the source**: "According to the latest documentation..."
- **Reference versions**: "In React 18..." or "As of Next.js 14..."
- **Provide context**: Explain why specific patterns are recommended
- **Include links**: Reference original documentation when possible

This rule ensures that all library and specification references are accurate, current, and based on authoritative sources rather than potentially outdated training data.
