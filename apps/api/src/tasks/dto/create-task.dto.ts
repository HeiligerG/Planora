import { Type } from 'class-transformer'
import {
    IsString,
    IsOptional,
    IsInt,
    IsArray,
    IsEnum,
    IsUUID,
    Min,
    Max,
    MinLength,
    IsDateString,
} from 'class-validator'

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export class CreateTaskDto {
    @IsString()
    @MinLength(1)
    title!: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsDateString()
    dueDate?: Date

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(3)
    priority?: number

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    estimatedMinutes?: number

    @IsOptional()
    @IsUUID()
    subjectId?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[]
}
