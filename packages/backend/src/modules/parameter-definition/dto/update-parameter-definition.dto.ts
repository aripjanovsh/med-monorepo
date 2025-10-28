import { PartialType } from "@nestjs/swagger";
import { CreateParameterDefinitionDto } from "./create-parameter-definition.dto";
import { Exclude } from "class-transformer";

@Exclude()
export class UpdateParameterDefinitionDto extends PartialType(CreateParameterDefinitionDto) {}
