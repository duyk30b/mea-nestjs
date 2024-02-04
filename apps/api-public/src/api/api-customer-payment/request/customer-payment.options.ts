import { Expose } from 'class-transformer'
import { IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class CustomerPaymentRelationQuery {}

export class CustomerPaymentFilterQuery {
  @Expose()
  @IsNumber()
  customerId: number
}

export class CustomerPaymentSortQuery extends SortQuery {}
