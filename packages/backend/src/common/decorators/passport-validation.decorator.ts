import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

@ValidatorConstraint({ name: "PassportValidation", async: false })
export class PassportValidationConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as any;

    // Check if any passport field has a value
    const passportFields = [
      object.passportSeries,
      object.passportNumber,
      object.passportIssuedBy,
      object.passportIssueDate,
      object.passportExpiryDate,
    ];

    const hasAnyPassportData = passportFields.some(
      (field) => field !== undefined && field !== null && field !== ""
    );

    // If no passport data is provided, validation passes
    if (!hasAnyPassportData) {
      return true;
    }

    // If any passport data is provided, current field must have a value
    return value !== undefined && value !== null && value !== "";
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} is required when any passport information is provided`;
  }
}

export function ValidatePassportFields(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PassportValidationConstraint,
    });
  };
}
