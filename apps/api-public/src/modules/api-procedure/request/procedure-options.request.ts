import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

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
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    isActive: boolean
}

export class ProcedureSortQuery extends SortQuery {}
