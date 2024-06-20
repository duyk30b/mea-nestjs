import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import { ConditionNumber, transformConditionNumber } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class VisitBatchRelationQuery {
  @Expose()
  @IsBoolean()
  visitProduct: boolean

  @Expose()
  @IsBoolean()
  batch: boolean
}
export class VisitBatchFilterQuery {
  @Expose()
  @IsNumber()
  visitId: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  batchId: number | ConditionNumber

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  visitProductId: number | ConditionNumber
}

export class VisitBatchSortQuery extends SortQuery {}
