import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionNumber, ConditionTimestamp } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProductBatchRelationQuery {
    @Expose()
    @IsBoolean()
    product: boolean
}
export class ProductBatchFilterQuery {
    @Expose()
    @IsNumber()
    productId: number

    @Expose()
    @Type(() => ConditionNumber)
    @ValidateNested({ each: true })
    quantity: ConditionNumber

    @Expose()
    @IsIn([0, 1])
    isActive: 0 | 1

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    expiryDate: ConditionTimestamp

    @Expose()
    @Type(() => ConditionTimestamp)
    @ValidateNested({ each: true })
    updatedAt: ConditionTimestamp
}

export class ProductBatchSortQuery extends SortQuery {
    @Expose()
    @IsIn(['ASC', 'DESC'])
    expiryDate: 'ASC' | 'DESC'
}
