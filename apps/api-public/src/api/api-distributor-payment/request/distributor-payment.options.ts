import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class DistributorPaymentRelationQuery {
  @Expose()
  @IsBoolean()
  paymentMethod: boolean

  @Expose()
  @IsBoolean()
  distributor: boolean
}

export class DistributorPaymentFilterQuery {
  @Expose()
  @IsNumber()
  distributorId: number
}

export class DistributorPaymentSortQuery extends SortQuery { }
