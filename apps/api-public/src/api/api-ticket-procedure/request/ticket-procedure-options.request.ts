import { Expose } from 'class-transformer'
import { IsBoolean, IsInt } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketProcedureRelationQuery {
  @Expose()
  @IsBoolean()
  procedure: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  imageList: boolean

  @Expose()
  @IsBoolean()
  ticketUser: boolean
}

export class TicketProcedureFilterQuery {
  @Expose()
  @IsInt()
  procedureId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number
}

export class TicketProcedureSortQuery extends SortQuery { }
