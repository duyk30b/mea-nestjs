import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketItemType } from '../../../../../../_libs/database/entities/payment-ticket-item.entity'
import { PaymentActionType } from '../../../../../../_libs/database/entities/payment.entity'

class TicketPaymentItemBody {
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
  sessionIndex: number

  @Expose()
  @IsDefined()
  @IsNumber()
  paidAdd: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtAdd: number
}

class TicketPaymentItemMapBody {
  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketRegimenBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureNoEffectBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureHasEffectBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductConsumableBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductPrescriptionBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryBodyList: TicketPaymentItemBody[]

  @ApiProperty({ type: TicketPaymentItemBody, isArray: true })
  @Expose()
  @Type(() => TicketPaymentItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketRadiologyBodyList: TicketPaymentItemBody[]
}

export class TicketPaymentMoneyBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentActionType)
  paymentActionType: PaymentActionType

  @Expose()
  @IsDefined()
  @IsNumber()
  paidAdd: number

  @Expose()
  @IsDefined()
  @IsNumber()
  paidItemAdd: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtAdd: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtItemAdd: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: TicketPaymentItemMapBody })
  @Expose()
  @Type(() => TicketPaymentItemMapBody)
  @ValidateNested({ each: true })
  ticketPaymentItemMapBody?: TicketPaymentItemMapBody
}
