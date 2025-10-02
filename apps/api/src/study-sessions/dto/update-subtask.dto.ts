import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator'

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