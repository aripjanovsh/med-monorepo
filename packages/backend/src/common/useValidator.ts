import { NestExpressApplication } from "@nestjs/platform-express";
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe as CoreValidationPipe,
  ArgumentMetadata,
} from "@nestjs/common";
import { replace, startCase } from "lodash";

export class ValidationPipe extends CoreValidationPipe {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return super.transform(value, metadata);
    } catch (error) {
      throw error;
    }
  }
}

export const reduceValidationMessage = (
  parent: string,
  errors: ValidationError[],
) => {
  return errors.reduce((accumulator: any, value) => {
    if (value.children && value.children.length) {
      const parentKey = parent ? `${parent}.${value.property}` : value.property;

      return {
        ...accumulator,
        ...reduceValidationMessage(parentKey, value.children),
      };
    }

    const key = parent ? `${parent}.${value.property}` : value.property;

    return {
      ...accumulator,
      [key]: Object.values(value.constraints).map((errorValue) => {
        return replace(errorValue, value.property, startCase(value.property));
      }),
    };
  }, {});
};

export const useValidator = (
  app: NestExpressApplication | INestApplication,
) => {
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          error: "Bad Request",
          fieldErrors: reduceValidationMessage("", errors),
          statusCode: 400,
        });
      },
    }),
  );
};
