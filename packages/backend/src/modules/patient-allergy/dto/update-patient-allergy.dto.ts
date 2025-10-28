import { PartialType } from "@nestjs/swagger";
import { CreatePatientAllergyDto } from "./create-patient-allergy.dto";
import { Exclude } from "class-transformer";

@Exclude()
export class UpdatePatientAllergyDto extends PartialType(CreatePatientAllergyDto) {}
