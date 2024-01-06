import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { ConditionNumber } from '../../../../../_libs/common/dto/condition-number'
import { ConditionTimestamp } from '../../../../../_libs/common/dto/condition-timestamp'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class ProductRelationQuery {
    @Expose()
    @IsBoolean()
    productBatches: boolean
}

export class ProductBatchFilterQuery {
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
}

export class ProductFilterQuery {
    @Expose()
    @Type(() => ProductBatchFilterQuery)
    @ValidateNested({ each: true })
    productBatch: ProductBatchFilterQuery

    @Expose()
    @IsString()
    group: string

    @Expose()
    @IsIn([0, 1])
    isActive: 0 | 1

    @Expose()
    @Type(() => ConditionNumber)
    @ValidateNested({ each: true })
    quantity: ConditionNumber
}

export class ProductSortQuery extends SortQuery {
    @Expose()
    @IsIn(['ASC', 'DESC'])
    brandName: 'ASC' | 'DESC'

    @Expose()
    @IsIn(['ASC', 'DESC'])
    quantity: 'ASC' | 'DESC'
}
