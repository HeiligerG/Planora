import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateTaskTagsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[]
}
