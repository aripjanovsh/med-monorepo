import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

export interface ConditionalValidationOptions {
  condition: (object: any) => boolean;
  validationOptions?: ValidationOptions;
}

@ValidatorConstraint({ name: "ConditionalValidation", async: false })
export class ConditionalValidationConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const options: ConditionalValidationOptions = args.constraints[0];
    const object = args.object as any;

    // If condition is not met, validation passes
    if (!options.condition(object)) {
      return true;
    }

    // If condition is met, check if value exists
    return value !== undefined && value !== null && value !== "";
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} is required when the specified condition is met`;
  }
}

export function ConditionalValidation(
  options: ConditionalValidationOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: ConditionalValidationConstraint,
    });
  };
}

// Specific decorator for user account creation requirements
export function RequiredForUserAccount(validationOptions?: ValidationOptions) {
  return ConditionalValidation(
    {
      condition: (object: any) => object.createUserAccount === true,
    },
    {
      message: "This field is required when creating a user account",
      ...validationOptions,
    }
  );
}

// Specific decorator for passport fields - if any passport field is provided, all become required
export function RequiredIfAnyPassportField(
  validationOptions?: ValidationOptions
) {
  return ConditionalValidation(
    {
      condition: (object: any) => {
        const passportFields = [
          object.passportSeries,
          object.passportNumber,
          object.passportIssuedBy,
          object.passportIssueDate,
          object.passportExpiryDate,
        ];
        // If any passport field has a value, all fields become required
        return passportFields.some(
          (field) => field !== undefined && field !== null && field !== ""
        );
      },
    },
    {
      message:
        "This field is required when any passport information is provided",
      ...validationOptions,
    }
  );
}
