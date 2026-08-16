import { ConditionTimestamp, createConditionEnum, transformConditionEnum } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { valuesEnum } from '@libs/common/helpers/typescript.helper'
import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { TicketActionType } from '@libs/database/common/variable'
import { PaymentTicketItemType } from '@libs/database/entities/payment_ticket.entity'
import { Expose, Transform, TransformFnParams, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class PaymentTicketRelationQuery {
  @Expose()
  @IsBoolean()
  payment?: boolean

  @Expose()
  @IsBoolean()
  ticket?: boolean

  @Expose()
  @IsBoolean()
  regimen?: boolean

  @Expose()
  @IsBoolean()
  procedure?: boolean

  @Expose()
  @IsBoolean()
  product?: boolean

  @Expose()
  @IsBoolean()
  laboratory?: boolean

  @Expose()
  @IsBoolean()
  radiology?: boolean
}

const ConditionEnumPaymentTicketItemType = createConditionEnum(PaymentTicketItemType)

export class PaymentTicketFilterQuery {
  @Expose()
  @IsString()
  paymentId: string

  @Expose()
  @IsString()
  ticketId: string

  @Expose()
  @IsEnumValue(TicketActionType)
  @IsIn(valuesEnum(TicketActionType))
  ticketActionType: TicketActionType

  @Expose()
  @Transform((params: TransformFnParams) => transformConditionEnum(params, PaymentTicketItemType))
  @IsOptional()
  paymentTicketItemType:
    | PaymentTicketItemType
    | InstanceType<typeof ConditionEnumPaymentTicketItemType>

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  createdAt: ConditionTimestamp
}

export class PaymentTicketSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  createdAt: 'ASC' | 'DESC'
}
