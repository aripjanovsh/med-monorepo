import { IsNotEmpty, IsString } from "class-validator";

export class StartVisitDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string;
}
