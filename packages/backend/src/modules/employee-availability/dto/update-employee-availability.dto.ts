import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateEmployeeAvailabilityDto } from "./create-employee-availability.dto";

export class UpdateEmployeeAvailabilityDto extends PartialType(
  OmitType(CreateEmployeeAvailabilityDto, ["employeeId"] as const)
) {}
