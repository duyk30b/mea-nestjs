import { Expose } from 'class-transformer'
import { IsBoolean, IsInt } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketProductRelationQuery {
  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  customer: boolean
}

export class TicketProductFilterQuery {
  @Expose()
  @IsInt()
  productId: number

  @Expose()
  @IsInt()
  batchId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number
}

export class TicketProductSortQuery extends SortQuery {}
