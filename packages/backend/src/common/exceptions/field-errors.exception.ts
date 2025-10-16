import { BadRequestException } from "@nestjs/common";

export class FieldErrorsException extends BadRequestException {
  constructor(fieldErrors: any) {
    super({
      error: "Bad Request",
      fieldErrors,
      statusCode: 400,
    });
  }
}
