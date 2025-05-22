import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

export class ReceiptPayment {
  @Expose()
  @IsDefined()
  @IsNumber()
  receiptId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  money: number
}

export class DistributorPaymentPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  distributorId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  paymentMethodId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiPropertyOptional({
    type: ReceiptPayment,
    isArray: true,
    example: [
      { receiptId: 12, money: 10000 },
      { receiptId: 13, money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => ReceiptPayment)
  @IsArray()
  @ValidateNested({ each: true })
  receiptPaymentList: ReceiptPayment[] // Phụ phí
}
