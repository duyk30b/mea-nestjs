import { createConditionEnum } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { DeliveryStatus } from '@libs/database/common/variable'
import { Expose } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsString } from 'class-validator'

export class TicketBatchRelationQuery {
  @Expose()
  @IsBoolean()
  product: boolean

  @Expose()
  @IsBoolean()
  batch: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  customer: boolean
}

const ConditionEnumDeliveryStatus = createConditionEnum(DeliveryStatus)

export class TicketBatchFilterQuery {
  @Expose()
  @IsInt()
  productId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsString()
  ticketId: string
}

export class TicketBatchSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  ticketProductId: 'ASC' | 'DESC'
}
