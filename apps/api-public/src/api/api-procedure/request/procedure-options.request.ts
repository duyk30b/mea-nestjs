import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProcedureFilterQuery {
    @ApiPropertyOptional({ name: 'filter[name]' })
    @Expose()
    @IsNotEmpty()
    @IsString()
    name: string

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

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    updatedAt: ConditionTimestamp
}

export class ProcedureSortQuery extends SortQuery {
    @Expose()
    @IsIn(['ASC', 'DESC'])
    name: 'ASC' | 'DESC'

    @Expose()
    @IsIn(['ASC', 'DESC'])
    price: 'ASC' | 'DESC'
}
