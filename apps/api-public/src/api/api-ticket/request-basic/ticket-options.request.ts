import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsDefined, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { VoucherType } from '../../../../../_libs/database/common/variable'
import { TicketStatus } from '../../../../../_libs/database/entities/ticket.entity'

export class TicketRelationQuery {
  @Expose()
  @IsBoolean()
  user: boolean

  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  customerPaymentList: boolean

  @Expose()
  @IsBoolean()
  ticketSurchargeList: boolean

  @Expose()
  @IsBoolean()
  ticketExpenseList: boolean

  @Expose()
  @IsBoolean()
  ticketProductList: boolean

  @Expose()
  @IsBoolean()
  ticketProcedureList: boolean

  @Expose()
  @IsBoolean()
  ticketDiagnosis: boolean

  @Expose()
  @IsBoolean()
  toAppointment: boolean

  @Expose()
  @IsBoolean()
  ticketRadiologyList: boolean
}

const ConditionEnumVoucherType = createConditionEnum(VoucherType)
const ConditionEnumTicketStatus = createConditionEnum(TicketStatus)

export class TicketFilterQuery {
  // @Expose()
  // @IsEnumValue(TicketStatus)
  // ticketStatus: TicketStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, TicketStatus))
  @IsOptional()
  ticketStatus: TicketStatus | InstanceType<typeof ConditionEnumTicketStatus>

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, VoucherType))
  @IsDefined()
  voucherType: VoucherType | InstanceType<typeof ConditionEnumVoucherType>

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class TicketSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}
