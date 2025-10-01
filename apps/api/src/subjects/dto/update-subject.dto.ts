import { CreateSubjectDto } from "./create-subject.dto"
import { PartialType } from "@nestjs/mapped-types"

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}