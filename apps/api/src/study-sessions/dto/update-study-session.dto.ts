import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator'

export class UpdateStudySessionDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsDateString()
  scheduledStart?: string

  @IsOptional()
  @IsDateString()
  scheduledEnd?: string

  @IsOptional()
  @IsDateString()
  actualStart?: string

  @IsOptional()
  @IsDateString()
  actualEnd?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}