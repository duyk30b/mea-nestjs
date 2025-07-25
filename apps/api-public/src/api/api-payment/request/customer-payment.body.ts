import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { PaymentVoucherItemType } from '../../../../../_libs/database/entities/payment-item.entity'

class PaymentPayDebt {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number
}

class PaymentPrepaymentTicketItem {
  @ApiProperty({ enum: PaymentVoucherItemType })
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentVoucherItemType)
  voucherItemType: PaymentVoucherItemType

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketItemId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentInteractId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number

  @Expose()
  @IsDefined()
  expectedPrice: number

  @Expose()
  @IsDefined()
  actualPrice: number

  @Expose()
  @IsDefined()
  quantity: number

  @Expose()
  @IsDefined()
  discountMoney: number

  @Expose()
  @IsDefined()
  discountPercent: number
}

class PaymentPrepayment {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @ApiProperty({ type: PaymentPrepaymentTicketItem, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => PaymentPrepaymentTicketItem)
  @IsArray()
  @ValidateNested({ each: true })
  itemList: PaymentPrepaymentTicketItem[]
}

class PaymentItemData {
  @ApiProperty({ type: PaymentPayDebt, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => PaymentPayDebt)
  @IsArray()
  @ValidateNested({ each: true })
  payDebt: PaymentPayDebt[]

  @ApiProperty({ type: PaymentPrepayment })
  @Expose()
  @IsOptional()
  @Type(() => PaymentPrepayment)
  @ValidateNested({ each: true })
  prepayment?: PaymentPrepayment

  @Expose()
  @IsDefined()
  @IsNumber()
  moneyTopUpAdd: number
}

export class CustomerPaymentBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  totalMoney: number

  @ApiPropertyOptional({ example: 'Khách hàng tạm ứng' })
  @Expose()
  @IsString()
  reason: string

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: PaymentItemData })
  @Expose()
  @IsDefined()
  @Type(() => PaymentItemData)
  @ValidateNested({ each: true })
  paymentItemData: PaymentItemData
}
