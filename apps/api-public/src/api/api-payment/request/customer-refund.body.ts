import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { PaymentVoucherItemType } from '../../../../../_libs/database/entities/payment-item.entity'

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
  expectedPrice: number

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
  @IsNumberGreaterThan(0)
  paidAmount: number
}

export class CustomerRefundBody {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  totalMoney: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsString()
  reason: string

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsString()
  note: string

  @ApiProperty({ type: PaymentPrepaymentTicketItem, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => PaymentPrepaymentTicketItem)
  @IsArray()
  @ValidateNested({ each: true })
  refundItemList: PaymentPrepaymentTicketItem[]
}
