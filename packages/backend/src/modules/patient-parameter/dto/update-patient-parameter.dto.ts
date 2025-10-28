import { PartialType } from "@nestjs/swagger";
import { CreatePatientParameterDto } from "./create-patient-parameter.dto";
import { Exclude } from "class-transformer";

@Exclude()
export class UpdatePatientParameterDto extends PartialType(CreatePatientParameterDto) {}
