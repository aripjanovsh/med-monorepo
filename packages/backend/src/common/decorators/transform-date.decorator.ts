import { Transform } from "class-transformer";

/**
 * Transform date string to Date object for Prisma
 * Safely handles all possible value types
 */
export const TransformDate = () => {
  return Transform(({ value }) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Already a Date object
    if (value instanceof Date) {
      return value;
    }

    // Handle string values
    if (typeof value === "string") {
      if (value.trim() === "") return value;
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }

    // For any other type, return as-is
    return value;
  });
};
