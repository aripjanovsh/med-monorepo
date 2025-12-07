import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateEmployeeLeaveDaysDto } from "./create-employee-leave-days.dto";

export class UpdateEmployeeLeaveDaysDto extends PartialType(
  OmitType(CreateEmployeeLeaveDaysDto, ["employeeId"] as const)
) {}
