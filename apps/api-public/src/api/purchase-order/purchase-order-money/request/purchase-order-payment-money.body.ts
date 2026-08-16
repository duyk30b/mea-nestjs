import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { PurchaseOrderActionType } from '@libs/database/common/variable'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class PurchaseOrderPaymentMoneyBody {
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
  @IsEnumValue(PurchaseOrderActionType)
  purchaseOrderActionType: PurchaseOrderActionType

  @Expose()
  @IsDefined()
  @IsNumber()
  paidTotal: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}
