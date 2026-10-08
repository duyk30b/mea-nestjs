import { ConditionTimestamp, createConditionEnum, transformConditionEnum } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { TicketLaboratoryStatus } from '@libs/database/common/variable'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'

export class TicketLaboratoryRelationQuery {
  @Expose()
  @IsOptional()
  laboratory: boolean

  @Expose()
  @IsOptional()
  laboratoryGroup: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  ticket: boolean

  @Expose()
  @IsBoolean()
  ticketUserRequestList: boolean
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
