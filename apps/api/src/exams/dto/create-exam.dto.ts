import { IsDateString, IsInt, IsOptional, IsString, IsUUID } from "class-validator";


export class CreateExamDto {

    @IsString()
    title!: string;

    @IsDateString()
    date!: string;

    @IsOptional()
    @IsInt()
    duration?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsUUID()
    subjectId!: string;

    @IsOptional()
    @IsInt()
    prepTimeNeeded?: number;

    @IsInt()
    risk!: number;
}