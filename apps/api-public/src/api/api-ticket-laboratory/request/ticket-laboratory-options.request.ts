import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'
import { ConditionTimestamp, createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { TicketLaboratoryStatus } from '../../../../../_libs/database/common/variable'

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

const ConditionEnumTicketLaboratoryStatus = createConditionEnum(TicketLaboratoryStatus)

export class TicketLaboratoryFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketLaboratoryStatus))
  @IsOptional()
  status?: TicketLaboratoryStatus | InstanceType<typeof ConditionEnumTicketLaboratoryStatus>

  @Expose()
  @IsInt()
  laboratoryId: number

  @Expose()
  @IsInt()
  customerId: number

  @Expose()
  @IsInt()
  ticketId: string

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class TicketLaboratorySortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
