import { PartialType } from "@nestjs/mapped-types";
import { CreateAppointmentCancelTypeDto } from "./create-appointment-cancel-type.dto";

export class UpdateAppointmentCancelTypeDto extends PartialType(
  CreateAppointmentCancelTypeDto
) {}
