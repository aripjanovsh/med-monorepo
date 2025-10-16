import { Decimal } from "@prisma/client/runtime/library";

/**
 * Safe Decimal class that handles undefined/null values gracefully
 * Used with @Type() decorator to properly transform Prisma Decimal fields
 */
export class SafeDecimal extends Decimal {
  constructor(value: any = 0) {
    // Handle null/undefined values safely
    if (value === null || value === undefined) {
      super(0);
      return;
    }

    // Handle existing Decimal instances
    if (value instanceof Decimal) {
      super(value.toString());
      return;
    }

    try {
      super(value);
    } catch (error) {
      // If Decimal creation fails, default to 0
      super(0);
    }
  }
}
