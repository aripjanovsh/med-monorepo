import { Transform } from "class-transformer";

/**
 * Transform empty string to default value
 * Safely handles all possible value types
 */
export const TransformEmpty = (defaultValue: any = undefined) => {
  return Transform(({ value }) => {
    if (value === "") {
      return defaultValue;
    }

    return value;
  });
};
