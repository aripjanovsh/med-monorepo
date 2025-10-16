import { Transform } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Transform Prisma Decimal to number for API responses
 * Safely handles all possible value types
 */
export const TransformDecimal = () => {
  return Transform(({ value }) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle Prisma Decimal instances
    if (value instanceof Decimal) {
      return value.toNumber();
    }

    // Handle string values (but not empty strings)
    if (typeof value === "string") {
      if (value.trim() === "") return value;
      const num = Number(value);
      return isNaN(num) ? value : num;
    }

    // Handle number values
    if (typeof value === "number") {
      return value;
    }

    // For any other type, return as-is
    return value;
  });
};
