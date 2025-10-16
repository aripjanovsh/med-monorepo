import { Transform } from "class-transformer";

/**
 * Transform Prisma Decimal to number for API responses
 * Safely handles all possible value types
 */
export const TransformEmpty = () => {
  return Transform(({ value }) => {
    if (value === "") {
      return undefined;
    }

    return value;
  });
};
