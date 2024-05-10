import { Expose } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { MovementType } from '../../../../../_libs/database/common/variable'

export class BatchMovementRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  invoice: boolean

  @Expose()
  @IsBoolean()
  receipt: boolean
}
export class BatchMovementFilterQuery {
  @Expose()
  @IsNumber()
  productId: number

  @Expose()
  @IsNumber()
  batchId: number

  @Expose()
  @IsEnum(MovementType)
  type: MovementType
}

export class BatchMovementSortQuery extends SortQuery {}
