---
trigger: model_decision
description: Extract magic numbers and hardcoded values to named constants with descriptive names
---

# Extract Magic Numbers to Named Constants

## The Problem

Agents frequently hardcode magic numbers and literal values directly in code instead of extracting them to named constants, leading to:

- **Maintenance burden**: Changes require hunting through multiple files
- **Unclear intent**: Numbers like `60`, `1.7`, `180` don't convey meaning
- **Copy-paste errors**: Duplicated literals get out of sync
- **Code review friction**: Reviewers can't understand business logic
- **Linting violations**: SonarJS flags duplicate literals
- **Testing difficulties**: Hardcoded values make tests brittle

## The Solution

**Always extract magic numbers, timing values, multipliers, and configuration literals to named constants** with descriptive names.

## When to Extract

### ✅ Always Extract These:

1. **Timing values**: Seconds, minutes, timeouts, delays
2. **Mathematical constants**: Multipliers, percentages, ratios
3. **Configuration values**: Thresholds, limits, defaults
4. **Business logic numbers**: Pricing, rates, quotas
5. **Repeated literals**: Any number used more than once
6. **Threshold values**: Min/max boundaries, cutoff points

### ⚠️ Keep Inline When:

1. **Array indices**: `array[0]`, `array[1]` (unless semantic meaning)
2. **Loop incrementors**: `i++`, `i += 1`
3. **Mathematical operations**: Basic math like `/ 2`, `* 10` in calculations
4. **Status codes**: Standard HTTP codes like `200`, `404`
5. **Single-use context**: Numbers used exactly once with clear context

## Implementation Guidelines

### Extract Pattern

```typescript
// ❌ BAD: Magic numbers
const timeout = 60000; // What is 60000?
const multiplier = 1.7; // Why 1.7?
const threshold = 85; // 85 what?

if (completionRate < 85) {
  // Magic number repeated
}

setTimeout(() => {
  // Another magic number
}, 60000);
```

```typescript
// ✅ GOOD: Named constants
const TIMEOUT_MILLISECONDS = 60000; // 60 seconds
const CLIPS_BONUS_MULTIPLIER = 1.7; // 70% bonus for clips
const INCIDENCE_RATE_THRESHOLD_PERCENT = 85; // Minimum completion rate

if (completionRate < INCIDENCE_RATE_THRESHOLD_PERCENT) {
  // Intent is clear
}

setTimeout(() => {
  // Clear what this timeout is for
}, TIMEOUT_MILLISECONDS);
```

### Naming Conventions

```typescript
// Include units and context in names
const BLOCK_TIMING_DEFAULT_SECONDS = 60;
const PAYOUT_BASE_CENTS_PER_MINUTE = 180;
const SETUP_BONUS_MINUTES = 1;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 50;
const HEALTH_CHECK_TIMEOUT_MS = 5000;
```

## Common Scenarios from Maze Codebase

### Scenario 1: Timing Configuration

```typescript
// ❌ FOUND IN HISTORY: Hardcoded timing
const getDefaultTimingConfig = () => ({
  short: 60,
  medium: 60,
  long: 60,
  default: 60,
});
```

```typescript
// ✅ EXTRACTED: Named constants
const BLOCK_TIMING_SHORT_SECONDS = 60;
const BLOCK_TIMING_DEFAULT_SECONDS = 60;
const BLOCK_TIMING_MEDIUM_SECONDS = 60;
const BLOCK_TIMING_LONG_SECONDS = 60;

const getDefaultTimingConfig = () => ({
  short: BLOCK_TIMING_SHORT_SECONDS,
  medium: BLOCK_TIMING_MEDIUM_SECONDS,
  long: BLOCK_TIMING_LONG_SECONDS,
  default: BLOCK_TIMING_DEFAULT_SECONDS,
});
```

### Scenario 2: Payout Calculations

```typescript
// ❌ FOUND IN HISTORY: Hardcoded multipliers
const reward = baseAmount * 1.7; // What is 1.7?
const setupBonus = 1; // 1 what?
const baseRate = 180; // 180 what?
```

```typescript
// ✅ EXTRACTED: Clear business logic
const CLIPS_BONUS_MULTIPLIER = 1.7; // 70% bonus for talk-aloud
const SETUP_BONUS_MINUTES = 1; // 1 minute setup time
const UNMODERATED_PRICE_CTS_PER_MINUTE = 180; // Base rate in cents

const reward = baseAmount * CLIPS_BONUS_MULTIPLIER;
const setupBonus = SETUP_BONUS_MINUTES;
const baseRate = UNMODERATED_PRICE_CTS_PER_MINUTE;
```

### Scenario 3: Thresholds and Limits

```typescript
// ❌ FOUND IN HISTORY: Magic thresholds
if (incidenceRate < 85) {
  cancelOrder();
}

const maxRetries = 3;
const defaultTimeout = 5000;
```

```typescript
// ✅ EXTRACTED: Named thresholds
const INCIDENCE_RATE_COMPUTATION_THRESHOLD = 85; // Minimum viable completion %
const MAX_RETRY_ATTEMPTS = 3; // Network resilience
const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 5000; // 5 second timeout

if (incidenceRate < INCIDENCE_RATE_COMPUTATION_THRESHOLD) {
  cancelOrder();
}
```

## Constant Organization

### File-Level Constants

```typescript
// At top of file for file-specific constants
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_FILE_SIZE_BYTES = 1048576; // 1MB
const RETRY_DELAY_MS = 1000;
```

### Package-Level Constants

```typescript
// packages/panel/src/constants/timing.ts
export const BLOCK_TIMING_SHORT_SECONDS = 30;
export const BLOCK_TIMING_DEFAULT_SECONDS = 60;
export const BLOCK_TIMING_LONG_SECONDS = 120;

// packages/panel/src/constants/pricing.ts
export const UNMODERATED_PRICE_CTS_PER_MINUTE = 180;
export const CLIPS_BONUS_MULTIPLIER = 1.7;
export const SETUP_BONUS_MINUTES = 1;
```

### Shared Constants

```typescript
// packages/shared/src/constants/common.ts
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_RETRY_ATTEMPTS = 3;
export const API_TIMEOUT_MS = 30000;
```

## Error Prevention

### Before Adding Numbers, Ask:

1. **Will this number be used elsewhere?**
2. **What does this number represent?**
3. **Could this number change based on business requirements?**
4. **Would a reviewer understand this number's purpose?**
5. **Is this a configuration that might vary by environment?**

### Warning Signs

- Using the same number in multiple places
- Numbers that represent business logic
- Comments explaining what a number means
- Numbers that might change based on requirements
- SonarJS warnings about duplicate literals

## Integration with Feature Flags

```typescript
// ✅ GOOD: Constants ready for dynamic configuration
const DEFAULT_INCIDENCE_RATE_THRESHOLD = 85;

// Later, easily configurable via feature flags
const threshold =
  featureFlag.incidenceRateThreshold ?? DEFAULT_INCIDENCE_RATE_THRESHOLD;
```

## Testing Benefits

```typescript
// ✅ GOOD: Easy to test edge cases
const MINIMUM_ORDER_SIZE = 5;

describe("order validation", () => {
  it("should reject orders below minimum", () => {
    expect(validateOrder(MINIMUM_ORDER_SIZE - 1)).toBe(false);
  });

  it("should accept orders at minimum", () => {
    expect(validateOrder(MINIMUM_ORDER_SIZE)).toBe(true);
  });
});
```

## Migration Strategy

When encountering magic numbers:

1. **Identify the business meaning** of the number
2. **Choose a descriptive constant name** with units
3. **Extract to appropriate scope** (file, package, or shared)
4. **Replace all occurrences** in the same logical area
5. **Add comments** explaining the business context if needed

## Communication

When suggesting constant extraction:

- **Explain the business context**: "This 60 represents the default block timing"
- **Suggest clear names**: "Should be `BLOCK_TIMING_DEFAULT_SECONDS`"
- **Consider scope**: "This could be shared across timing configurations"
- **Think future**: "This makes it easy to make configurable later"

This rule helps create self-documenting code that's easier to maintain, test, and configure while reducing the likelihood of bugs from inconsistent hardcoded values.
