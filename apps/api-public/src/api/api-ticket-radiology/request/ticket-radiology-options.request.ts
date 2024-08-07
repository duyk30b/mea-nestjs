import { Expose } from 'class-transformer'
import { IsBoolean, IsInt } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketRadiologyRelationQuery {
  @Expose()
  @IsBoolean()
  radiology: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  doctor: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  imageList: boolean
}

export class TicketRadiologyFilterQuery {
  @Expose()
  @IsInt()
  radiologyId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number
}

export class TicketRadiologySortQuery extends SortQuery { }
