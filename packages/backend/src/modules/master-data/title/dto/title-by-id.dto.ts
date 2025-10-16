import { IsString, IsUUID } from "class-validator";

export class EmployeeTitleByIdDto {
  @IsString({ message: "ID организации должен быть строкой" })
  @IsUUID("4", { message: "ID организации должен быть валидным UUID" })
  organizationId: string;
}
