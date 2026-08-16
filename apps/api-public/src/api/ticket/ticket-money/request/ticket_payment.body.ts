import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { DiscountType, TicketActionType } from '@libs/database/common/variable'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { PaymentTicketItemType } from '@libs/database/entities/payment_ticket.entity'
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

class PaymentTicketItemBody {
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentTicketItemType)
  paymentTicketItemType: PaymentTicketItemType

  @Expose()
  @IsDefined()
  @IsString()
  ticketItemId: string

  @Expose()
  @IsDefined()
  @IsInt()
  ticketItemInteractId: number

  @Expose()
  @IsDefined()
  sessionIndex: number

  @Expose()
  @IsDefined()
  expectedPrice: number

  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @Expose()
  @IsDefined()
  discountMoney: number

  @Expose()
  @IsDefined()
  discountPercent: number

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
  @IsNumber()
  paidMoney: number
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
}

class PaymentTicketDiscountBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  paidMoney: number
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
  paymentTicketRegimenList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketProcedureNoEffectList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketProcedureHasEffectList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketProductConsumableList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketProductPrescriptionList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketLaboratoryList: PaymentTicketItemBody[]

  @ApiProperty({ type: PaymentTicketItemBody, isArray: true })
  @Expose()
  @Type(() => PaymentTicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  paymentTicketRadiologyList: PaymentTicketItemBody[]
}

export class TicketPaymentMoneyBody {
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentActionType)
  paymentActionType: PaymentActionType

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @Expose()
  @IsDefined()
  @IsEnumValue(TicketActionType)
  ticketActionType: TicketActionType

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isPaymentEachItem: 0 | 1

  @Expose()
  @IsDefined()
  @IsNumber()
  paidTotal: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: PaymentTicketItemMapBody })
  @Expose()
  @Type(() => PaymentTicketItemMapBody)
  @ValidateNested({ each: true })
  paymentTicketItemMap?: PaymentTicketItemMapBody
}
