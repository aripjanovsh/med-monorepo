import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CompleteVisitDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
