import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
    @IsPositive()
    @IsOptional()
    limit: number;

    @IsPositive()
    @IsOptional()
    offset: number;
}
