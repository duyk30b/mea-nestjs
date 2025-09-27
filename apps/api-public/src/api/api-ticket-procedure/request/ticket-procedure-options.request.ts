import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionString,
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
  transformConditionString,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { PaymentMoneyStatus } from '../../../../../_libs/database/common/variable'
import {
  TicketProcedureStatus,
  TicketProcedureType,
} from '../../../../../_libs/database/entities/ticket-procedure.entity'

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

const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)
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
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus?: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

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
