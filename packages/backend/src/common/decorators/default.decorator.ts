import { Transform } from "class-transformer";

/**
 * Transform date string to Date object for Prisma
 * Safely handles all possible value types
 */
export const Default = (defaultValue: any) => {
  return Transform(({ value }) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value;
  });
};
