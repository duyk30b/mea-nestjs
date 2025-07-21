import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional } from 'class-validator'
import { createConditionEnum, transformConditionEnum } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { PaymentMoneyStatus } from '../../../../../_libs/database/common/variable'

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

const ConditionEnumPaymentMoneyStatus = createConditionEnum(PaymentMoneyStatus)

export class TicketProcedureFilterQuery {
  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentMoneyStatus))
  @IsOptional()
  paymentMoneyStatus: PaymentMoneyStatus | InstanceType<typeof ConditionEnumPaymentMoneyStatus>

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
