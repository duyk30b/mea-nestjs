import { Expose } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class TicketLaboratoryRelationQuery {
  @Expose()
  @IsOptional()
  laboratoryList: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticketUserList: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean
}

export class TicketLaboratoryFilterQuery {
  @Expose()
  @IsInt()
  laboratoryId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: number
}

export class TicketLaboratorySortQuery extends SortQuery { }
