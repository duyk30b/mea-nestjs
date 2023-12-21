import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export class ProcedureFilterQuery {
    @ApiPropertyOptional({ name: 'filter[searchText]' })
    @Expose()
    @IsNotEmpty()
    @IsString()
    searchText: string

    @ApiPropertyOptional({ name: 'filter[group]' })
    @Expose({ name: 'group' })
    @IsString()
    group: string

    @ApiPropertyOptional({ name: 'filter[isActive]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return 1
        if (['0', 'false'].includes(value)) return 0
        return undefined
    })
    @IsIn([0, 1])
    isActive: 0 | 1
}

export class ProcedureSortQuery extends SortQuery {}
