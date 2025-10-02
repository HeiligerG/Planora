import { IsString, IsInt, Min, IsOptional } from 'class-validator'

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