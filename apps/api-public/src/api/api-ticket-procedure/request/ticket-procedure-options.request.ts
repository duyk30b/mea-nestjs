import {
    ConditionNumber,
    ConditionString,
    ConditionTimestamp,
    createConditionEnum,
    transformConditionEnum,
    transformConditionString,
} from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { TicketItemPaymentType } from '@libs/database/common/variable'
import {
    TicketProcedureStatus,
    TicketProcedureType,
} from '@libs/database/entities/ticket-procedure.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'

export class TicketProcedureRelationQuery {
  @Expose()
  @IsBoolean()
  procedure?: boolean

  @Expose()
  @IsBoolean()
  customer?: boolean

  @Expose()
  @IsBoolean()
  ticket?: boolean

  @Expose()
  @IsBoolean()
  imageList?: boolean

  @Expose()
  @IsBoolean()
  ticketUserRequestList?: boolean

  @Expose()
  @IsBoolean()
  ticketUserResultList?: boolean
}

const ConditionEnumTicketItemPaymentType = createConditionEnum(TicketItemPaymentType)
const ConditionEnumTicketProcedureStatus = createConditionEnum(TicketProcedureStatus)

export class TicketProcedureFilterQuery {
  @Expose()
  @IsInt()
  oid?: number

  @Expose()
  @Transform(transformConditionString)
  @IsOptional()
  id?: string | ConditionString

  @Expose()
  @Transform(transformConditionString)
  @IsOptional()
  ticketId?: string | ConditionString

  @Expose()
  @Transform(transformConditionString)
  @IsOptional()
  ticketRegimenId?: string | ConditionString

  @Expose()
  @IsOptional()
  customerId?: number | ConditionNumber

  @Expose()
  @IsInt()
  procedureId?: number

  @Expose()
  @IsEnumValue(TicketProcedureType)
  ticketProcedureType?: TicketProcedureType

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketItemPaymentType))
  @IsOptional()
  ticketItemPaymentType?: TicketItemPaymentType | InstanceType<typeof ConditionEnumTicketItemPaymentType>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketProcedureStatus))
  @IsOptional()
  status?: TicketProcedureStatus | InstanceType<typeof ConditionEnumTicketProcedureStatus>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt?: ConditionTimestamp
}

export class TicketProcedureSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority?: 'ASC' | 'DESC'

  @Expose()
  @IsIn(['ASC', 'DESC'])
  completedAt?: 'ASC' | 'DESC'
}
