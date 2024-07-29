import { Expose } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketRadiologyRelationQuery {
  @Expose()
  @IsOptional()
  radiology:
    | { radiologyGroup?: boolean; printHtml?: boolean }
    | false

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticketUserList: boolean

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
