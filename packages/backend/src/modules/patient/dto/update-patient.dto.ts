import { PartialType, OmitType } from "@nestjs/swagger";
import { CreatePatientDto } from "./create-patient.dto";
import { Exclude, Expose } from "class-transformer";
import { IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { InjectOrganizationId } from "../../../common/decorators/inject-organization-id.decorator";

@Exclude()
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  // Exclusion field for uniqueness validation
  @ApiProperty({
    description: "Patient ID to exclude from validation",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  excludePatientId?: string;
}
