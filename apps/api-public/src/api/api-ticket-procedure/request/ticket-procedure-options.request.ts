import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsInt, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionNumber,
  ConditionTimestamp,
  createConditionEnum,
  transformConditionEnum,
  transformConditionNumber,
} from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PaymentMoneyStatus, TicketProcedureStatus } from '../../../../../_libs/database/common/variable'

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
  ticketProcedureItemList?: { imageList?: boolean }

  @Expose()
  @IsBoolean()
  ticketUserList?: boolean
}

const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)
const ConditionEnumTicketProcedureStatus = createConditionEnum(TicketProcedureStatus)

export class TicketProcedureFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus?: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketProcedureStatus))
  @IsOptional()
  status?: TicketProcedureStatus | InstanceType<typeof ConditionEnumTicketProcedureStatus>

  @Expose()
  @IsInt()
  procedureId?: number

  @Expose()
  @IsInt()
  oid?: number

  @Expose()
  @IsInt()
  customerId?: number

  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  ticketId?: number | ConditionNumber

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt?: ConditionTimestamp
}

export class TicketProcedureSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority?: 'ASC' | 'DESC'
}
