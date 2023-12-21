import { ApiPropertyOptional } from '@nestjs/swagger'
import { SortQuery } from 'apps/api-public/src/common/query'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { transformComparisonQuery } from '../../../../../_libs/common/transform-validate/class-transform.custom'
import { ComparisonType } from '../../../../../_libs/database/common/base.dto'

export class CustomerRelationQuery {
    @ApiPropertyOptional({ name: 'relation[invoices]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    invoices: boolean

    @ApiPropertyOptional({ name: 'relation[customerDebts]' })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return true
        if (['0', 'false'].includes(value)) return false
        return undefined
    })
    @IsBoolean()
    customerDebts: boolean
}

export class CustomerFilterQuery {
    @ApiPropertyOptional({ name: 'filter[isActive]', example: 1 })
    @Expose()
    @Transform(({ value }) => {
        if (['1', 'true'].includes(value)) return 1
        if (['0', 'false'].includes(value)) return 0
        return undefined
    })
    @IsIn([0, 1])
    isActive: 0 | 1

    @ApiPropertyOptional({ name: 'filter[fullName]' })
    @Expose()
    @IsNotEmpty()
    @IsString()
    fullName: string

    @ApiPropertyOptional({ name: 'filter[phone]' })
    @Expose()
    @IsNotEmpty()
    @IsString()
    phone: string

    @ApiPropertyOptional({ name: 'filter[debt]', type: 'string', example: '[">",0]' })
    @Expose()
    @Transform(({ value }) => transformComparisonQuery(value, 'Number'))
    @IsArray({ message: '$property validate failed: Example: [">",0]' })
    debt: [ComparisonType, number]
}

export class CustomerSortQuery extends SortQuery {
    @ApiPropertyOptional({ name: 'sort[debt]', enum: ['ASC', 'DESC'], example: 'DESC' })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    debt: 'ASC' | 'DESC'

    @ApiPropertyOptional({ name: 'sort[fullName]', enum: ['ASC', 'DESC'], example: 'DESC' })
    @Expose()
    @IsIn(['ASC', 'DESC'])
    fullName: 'ASC' | 'DESC'
}
