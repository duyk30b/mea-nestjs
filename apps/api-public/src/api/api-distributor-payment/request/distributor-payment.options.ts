import { Expose } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class DistributorPaymentRelationQuery {}

export class DistributorPaymentFilterQuery {
  @Expose()
  @IsNumber()
  distributorId: number
}

export class DistributorPaymentSortQuery extends SortQuery {}
