---
trigger: model_decision
description: This guide defines the standard utility libraries to use for common programming tasks in the backend application.
---

# Utility Libraries Guide

This guide defines the standard utility libraries to use for common programming tasks in the backend application.

## 1. Date and Time Operations - Use `date-fns`

For all date and time operations, **ALWAYS** use `date-fns` library. **NEVER** use native JavaScript Date methods for calculations or formatting.

### Why date-fns?

- ✅ Immutable and pure functions
- ✅ Tree-shakable (only import what you need)
- ✅ TypeScript support out of the box
- ✅ Consistent API across all functions
- ✅ No timezone issues with proper usage

### Common date-fns Operations

```typescript
import {
  format,
  parseISO,
  addDays,
  addMonths,
  subDays,
  differenceInDays,
  differenceInYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  isEqual,
  isWithinInterval,
  compareAsc,
  compareDesc,
} from "date-fns";

// Formatting dates
const formattedDate = format(new Date(), "yyyy-MM-dd");
const formattedDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
const customFormat = format(new Date(), "dd MMMM yyyy");

// Parsing dates
const date = parseISO("2024-01-15T10:30:00.000Z");

// Adding/Subtracting
const tomorrow = addDays(new Date(), 1);
const nextMonth = addMonths(new Date(), 1);
const yesterday = subDays(new Date(), 1);

// Comparing dates
const isLater = isAfter(date1, date2);
const isEarlier = isBefore(date1, date2);
const isSame = isEqual(date1, date2);

// Date differences
const daysDiff = differenceInDays(date1, date2);
const age = differenceInYears(new Date(), birthDate);

// Start/End of periods
const todayStart = startOfDay(new Date());
const todayEnd = endOfDay(new Date());
const monthStart = startOfMonth(new Date());
const monthEnd = endOfMonth(new Date());

// Checking ranges
const isInRange = isWithinInterval(date, {
  start: startDate,
  end: endDate,
});

// Sorting
const sortedDates = dates.sort(compareAsc); // ascending
const sortedDatesDesc = dates.sort(compareDesc); // descending
```

### Date Validation Example

```typescript
import { isValid, parseISO, isPast, isFuture } from "date-fns";

function validateDateOfBirth(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date) && isPast(date);
}

function validateExpiryDate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isValid(date) && isFuture(date);
}
```

### Date Range Queries for Prisma

```typescript
import { startOfDay, endOfDay } from "date-fns";

// Filter by specific day
const where: Prisma.AppointmentWhereInput = {
  createdAt: {
    gte: startOfDay(targetDate),
    lte: endOfDay(targetDate),
  },
};

// Filter by date range
const where: Prisma.AppointmentWhereInput = {
  createdAt: {
    gte: startDate,
    lte: endDate,
  },
};
```

### Date-fns Rules:

1. **ALWAYS** use `date-fns` for date operations
2. Use `parseISO()` to convert ISO strings to Date objects
3. Use `format()` for displaying dates, not `toLocaleDateString()`
4. Use comparison functions (`isAfter`, `isBefore`) instead of `>`/`<` operators
5. Use `startOfDay`/`endOfDay` for date-only comparisons
6. Import only the functions you need (tree-shaking)
7. Handle invalid dates with `isValid()` before operations

## 2. Utility Functions - Use `lodash`

For common utility operations like object manipulation, array operations, and data transformations, **ALWAYS** use `lodash`.

### Why lodash?

- ✅ Battle-tested and reliable
- ✅ Handles edge cases (null, undefined, etc.)
- ✅ Consistent API
- ✅ Performance optimized
- ✅ TypeScript support with `@types/lodash`

### Common lodash Operations

```typescript
import {
  get,
  set,
  omit,
  pick,
  isEmpty,
  isNil,
  isUndefined,
  isNull,
  merge,
  cloneDeep,
  uniq,
  uniqBy,
  groupBy,
  keyBy,
  orderBy,
  chunk,
  flatten,
  flattenDeep,
  compact,
  difference,
  intersection,
  union,
  debounce,
  throttle,
} from "lodash";

// Safe property access
const value = get(object, "deeply.nested.property", defaultValue);
const organizationId = get(request, "user.organizationId", null);

// Set nested properties
set(object, "deeply.nested.property", value);

// Object manipulation
const sanitized = omit(user, ["password", "salt"]);
const extracted = pick(user, ["id", "email", "role"]);
const merged = merge({}, defaults, userConfig);
const copied = cloneDeep(originalObject);

// Check empty/null/undefined
const hasValue = !isEmpty(value); // true for non-empty strings, arrays, objects
const isNothing = isNil(value); // true for null or undefined
const isUndefinedValue = isUndefined(value);
const isNullValue = isNull(value);

// Array operations
const uniqueIds = uniq([1, 2, 2, 3, 3, 4]);
const uniqueUsers = uniqBy(users, "id");
const grouped = groupBy(employees, "departmentId");
const indexed = keyBy(employees, "id");
const sorted = orderBy(employees, ["lastName", "firstName"], ["asc", "asc"]);

// Array transformations
const chunks = chunk(items, 10); // Split into chunks of 10
const flat = flatten([
  [1, 2],
  [3, 4],
]); // [1, 2, 3, 4]
const deepFlat = flattenDeep([[1, [2, [3, 4]]]]); // [1, 2, 3, 4]
const noNulls = compact([0, 1, false, 2, "", 3, null, undefined]); // [1, 2, 3]

// Set operations
const diff = difference([1, 2, 3], [2, 3, 4]); // [1]
const inter = intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
const combined = union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]

// Performance optimization
const debouncedSearch = debounce(searchFunction, 300);
const throttledScroll = throttle(scrollHandler, 100);
```

### Real-World Examples

#### Safe Data Extraction

```typescript
import { get } from "lodash";

// Instead of this ❌
const organizationId = request?.user?.organizationId ?? null;

// Use this ✅
const organizationId = get(request, "user.organizationId", null);
```

#### Object Transformation for API Response

```typescript
import { omit, pick } from "lodash";

// Remove sensitive fields
const safeUser = omit(user, ["password", "salt", "resetToken"]);

// Extract only needed fields
const userProfile = pick(user, ["id", "firstName", "lastName", "email"]);
```

#### Group and Index Data

```typescript
import { groupBy, keyBy } from "lodash";

// Group employees by department
const byDepartment = groupBy(employees, "departmentId");
// { "dept-1": [emp1, emp2], "dept-2": [emp3] }

// Index for O(1) lookup
const employeeById = keyBy(employees, "id");
// { "id-1": emp1, "id-2": emp2 }
```

#### Sorting Complex Data

```typescript
import { orderBy } from "lodash";

// Sort by multiple fields
const sorted = orderBy(
  employees,
  ["department", "lastName", "firstName"],
  ["asc", "asc", "asc"]
);
```

#### Array Deduplication

```typescript
import { uniqBy } from "lodash";

// Remove duplicates by ID
const uniqueEmployees = uniqBy(employees, "id");

// Remove duplicates by email
const uniqueByEmail = uniqBy(users, "email");
```

#### Deep Clone for Immutability

```typescript
import { cloneDeep } from "lodash";

// Safe deep copy
const configCopy = cloneDeep(originalConfig);
configCopy.database.password = "new-password";
// originalConfig is unchanged
```

#### Merging Configuration

```typescript
import { merge } from "lodash";

const defaultConfig = {
  pagination: { page: 1, limit: 10 },
  sorting: { field: "createdAt", order: "desc" },
};

const userConfig = {
  pagination: { limit: 25 },
};

// Deep merge
const finalConfig = merge({}, defaultConfig, userConfig);
// { pagination: { page: 1, limit: 25 }, sorting: { ... } }
```

### Modern JavaScript vs lodash

While modern JavaScript has some native methods, **prefer lodash** for:

1. **Null safety**: lodash handles null/undefined gracefully
2. **Deep operations**: `cloneDeep`, `merge`, nested `get`/`set`
3. **Complex array operations**: `uniqBy`, `groupBy`, `orderBy`
4. **Performance optimization**: `debounce`, `throttle`

Use native methods only for simple, safe operations:

```typescript
// ✅ Native is fine for simple cases
const doubled = numbers.map((n) => n * 2);
const filtered = items.filter((item) => item.active);
const found = items.find((item) => item.id === targetId);

// ✅ Use lodash for complex/nested operations
const grouped = groupBy(items, "category");
const value = get(obj, "deeply.nested.prop", defaultValue);
const merged = merge({}, obj1, obj2, obj3);
```

### lodash Rules:

1. **ALWAYS** use lodash for null-safe property access (`get`)
2. Use `omit`/`pick` for object field filtering
3. Use `groupBy`/`keyBy` for data organization
4. Use `orderBy` for multi-field sorting
5. Use `cloneDeep` when you need true immutability
6. Use `merge` for deep object merging
7. Use `uniqBy` for deduplication by property
8. Use `debounce`/`throttle` for performance optimization
9. Import functions individually for tree-shaking
10. Check for empty/null/undefined with `isEmpty`, `isNil`, `isUndefined`

## 3. Combining date-fns and lodash

Often you'll need both libraries together:

```typescript
import { format, parseISO, isValid } from "date-fns";
import { groupBy, orderBy, compact } from "lodash";

// Example: Group appointments by date and sort
function groupAppointmentsByDate(appointments: Appointment[]) {
  // Filter invalid dates and format
  const withFormattedDates = compact(
    appointments.map((apt) => {
      const date = parseISO(apt.scheduledAt);
      if (!isValid(date)) return null;
      return {
        ...apt,
        dateKey: format(date, "yyyy-MM-dd"),
      };
    })
  );

  // Group by date
  const grouped = groupBy(withFormattedDates, "dateKey");

  // Sort within each group
  Object.keys(grouped).forEach((dateKey) => {
    grouped[dateKey] = orderBy(grouped[dateKey], ["scheduledAt"], ["asc"]);
  });

  return grouped;
}
```

## 4. Installation

Make sure these packages are installed:

```bash
pnpm add date-fns lodash
pnpm add -D @types/lodash
```

## Summary

- ✅ **Date/Time operations**: Use `date-fns`
- ✅ **Utility functions**: Use `lodash`
- ❌ **NEVER** use native JavaScript for complex date operations
- ❌ **NEVER** manually implement utility functions that lodash provides
- ✅ Import only what you need for optimal bundle size
- ✅ Handle edge cases (null, undefined, invalid dates) with library functions

These libraries are the standard for the project. Using them ensures code consistency, reliability, and maintainability.
