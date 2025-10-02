import { Type } from 'class-transformer'
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator'

export class BulkStudySessionItemDto {
  @IsString()
  title!: string

  @IsDateString()
  scheduledStart!: string

  @IsDateString()
  scheduledEnd!: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class BulkCreateStudySessionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkStudySessionItemDto)
  sessions!: BulkStudySessionItemDto[]
}
