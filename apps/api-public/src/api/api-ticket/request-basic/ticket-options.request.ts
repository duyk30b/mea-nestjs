import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import {
  ConditionTimestamp,
  SortQuery,
  createConditionEnum,
  transformConditionEnum,
} from '../../../../../_libs/common/dto'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
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
  ticketRadiologyList: boolean
}

const ConditionEnumVoucherType = createConditionEnum(VoucherType)

export class TicketFilterQuery {
  @Expose()
  @IsEnumValue(TicketStatus)
  ticketStatus: TicketStatus

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, VoucherType))
  @IsOptional()
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
