import { IsInt, IsOptional, IsString, Min } from "class-validator"


export class CreateSubjectDto {

    @IsString()
    name!: string

    @IsOptional()
    @IsString()
    color!: string

    @IsOptional()
    @IsInt()
    @Min(0)
    weeklyGoalMinutes!: number
}