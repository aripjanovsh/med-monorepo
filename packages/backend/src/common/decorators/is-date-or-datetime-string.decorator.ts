import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

/**
 * Custom validator that accepts both:
 * - Date-only format: YYYY-MM-DD (e.g., "1990-02-20")
 * - Full ISO 8601 datetime format: YYYY-MM-DDTHH:mm:ss.sssZ
 *
 * This is useful for fields like dateOfBirth where frontend may send date-only format
 */
export function IsDateOrDateTimeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isDateOrDateTimeString",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          // If already transformed to Date object by @TransformDate(), accept it
          if (value instanceof Date) {
            return !isNaN(value.getTime());
          }

          // If still a string, validate format
          if (typeof value !== "string") {
            return false;
          }

          // Try to parse as Date
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return false;
          }

          // Check if it matches date-only format (YYYY-MM-DD)
          const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
          if (dateOnlyPattern.test(value)) {
            return true;
          }

          // Check if it's a valid ISO 8601 datetime string
          const isoPattern =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
          if (isoPattern.test(value)) {
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date string in format YYYY-MM-DD or ISO 8601 datetime`;
        },
      },
    });
  };
}
