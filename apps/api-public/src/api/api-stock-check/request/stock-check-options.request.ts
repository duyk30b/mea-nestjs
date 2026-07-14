import {
    ConditionTimestamp,
    createConditionEnum,
    transformConditionEnum,
} from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { StockCheckStatus } from '@libs/database/entities/stock-check.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'

export class StockCheckRelationQuery {
  @Expose()
  @IsOptional()
  stockCheckItemList: false | { product?: boolean; batch?: boolean }

  @Expose()
  @IsBoolean()
  updatedByUser: boolean

  @Expose()
  @IsBoolean()
  createdByUser: boolean

  @Expose()
  @IsOptional()
  reconciledByUser: boolean
}

const ConditionEnumStockCheckStatus = createConditionEnum(StockCheckStatus)

export class StockCheckFilterQuery {
  @Expose()
  @IsNumber()
  createdByUserId: number

  @Expose()
  @IsNumber()
  updatedByUserId: number

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, StockCheckStatus))
  @IsOptional()
  status: StockCheckStatus | InstanceType<typeof ConditionEnumStockCheckStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class StockCheckSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
