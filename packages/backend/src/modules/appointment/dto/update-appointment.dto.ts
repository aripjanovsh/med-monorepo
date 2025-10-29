import { PartialType } from "@nestjs/swagger";
import { CreateAppointmentDto } from "./create-appointment.dto";
import { Exclude } from "class-transformer";

@Exclude()
export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
