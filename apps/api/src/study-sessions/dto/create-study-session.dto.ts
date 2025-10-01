import { IsDateString, IsInt, IsOptional, IsString, IsArray, IsBoolean, Min } from 'class-validator'

export class CreateStudySessionDto {
  @IsString()
  title!: string

  @IsDateString()
  scheduledStart!: string

  @IsDateString()
  scheduledEnd!: string

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

export class CreateSubtaskDto {
  @IsString()
  description!: string

  @IsInt()
  @Min(1)
  estimatedMinutes!: number

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedMinutes?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  actualMinutes?: number

  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}