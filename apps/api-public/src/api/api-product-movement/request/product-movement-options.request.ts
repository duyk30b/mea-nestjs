import { Expose } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { ProductMovementType } from '../../../../../_libs/database/entities/product-movement.entity'

export class ProductMovementRelationQuery {
    @Expose()
    @IsBoolean()
    productBatch: boolean

    @Expose()
    @IsBoolean()
    invoice: boolean

    @Expose()
    @IsBoolean()
    receipt: boolean
}
export class ProductMovementFilterQuery {
    @Expose()
    @IsNumber()
    productId: number

    @Expose()
    @IsNumber()
    productBatchId: number

    @Expose()
    @IsEnum(ProductMovementType)
    type: ProductMovementType
}

export class ProductMovementSortQuery extends SortQuery {}
