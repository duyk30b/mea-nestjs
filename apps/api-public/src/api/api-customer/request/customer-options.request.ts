import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionNumber } from '../../../../../_libs/common/dto/condition-number'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class CustomerRelationQuery {
    @Expose()
    @IsBoolean()
    invoices: boolean

    @Expose()
    @IsBoolean()
    customerDebts: boolean
}

export class CustomerFilterQuery {
    @Expose()
    @IsIn([0, 1])
    isActive: 0 | 1

    @Expose()
    @IsNotEmpty()
    @IsString()
    fullName: string

    @Expose()
    @IsNotEmpty()
    @IsString()
    phone: string

    @Expose()
    @Type(() => ConditionNumber)
    @ValidateNested({ each: true })
    debt: ConditionNumber

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    updatedAt: ConditionTimestamp
}

export class CustomerSortQuery extends SortQuery {
    @Expose()
    @IsIn(['ASC', 'DESC'])
    debt: 'ASC' | 'DESC'

    @Expose()
    @IsIn(['ASC', 'DESC'])
    fullName: 'ASC' | 'DESC'
}
