import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketItemType } from '../../../../../../_libs/database/entities/payment-ticket-item.entity'
import { PaymentActionType } from '../../../../../../_libs/database/entities/payment.entity'

class PaymentTicketItemBody {
  @Expose()
  @IsDefined()
  @IsEnumValue(TicketItemType)
  ticketItemType: TicketItemType

  @Expose()
  @IsDefined()
  @IsString()
  ticketItemId: string

  @Expose()
  @IsDefined()
  @IsInt()
  interactId: number

  @Expose()
  @IsDefined()
  expectedPrice: number

  @Expose()
  @IsDefined()
  discountMoney: number

  @Expose()
  @IsDefined()
  discountPercent: number

  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @Expose()
  @IsDefined()
  actualPrice: number

  @Expose()
  @IsDefined()
  quantity: number

  @Expose()
  @IsDefined()
  unitRate: number

  @Expose()
  @IsDefined()
  sessionIndex: number

  @Expose()
  @IsDefined()
  @IsNumber()
  paidMoney: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtMoney: number
}

class PaymentTicketWaitBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  paidMoney: number
}

class PaymentTicketSurchargeBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  paidMoney: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtMoney: number
}

class PaymentTicketDiscountBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  paidMoney: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtMoney: number
}

class PaymentTicketItemMapBody {
  @ApiProperty({ type: PaymentTicketWaitBody })
  @Expose()
  @Type(() => PaymentTicketWaitBody)
  @ValidateNested({ each: true })
  paymentWait: PaymentTicketWaitBody

  @ApiProperty({ type: PaymentTicketSurchargeBody })
  @Expose()
  @Type(() => PaymentTicketSurchargeBody)
  @ValidateNested({ each: true })
  paymentSurcharge: PaymentTicketSurchargeBody

  @ApiProperty({ type: PaymentTicketDiscountBody })
  @Expose()
  @Type(() => PaymentTicketDiscountBody)
  @ValidateNested({ each: true })
  paymentDiscount: PaymentTicketDiscountBody

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketRegimenBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureNoEffectBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureHasEffectBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductConsumableBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductPrescriptionBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryBodyList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketRadiologyBodyList: PaymentTicketItemBody[]
}

export class TicketPaymentMoneyBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  hasPaymentItem: 0 | 1

  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentActionType)
  paymentActionType: PaymentActionType

  @Expose()
  @IsDefined()
  @IsNumber()
  paidTotal: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtTotal: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: PaymentTicketItemMapBody })
  @Expose()
  @Type(() => PaymentTicketItemMapBody)
  @ValidateNested({ each: true })
  paymentTicketItemMapDto?: PaymentTicketItemMapBody
}
