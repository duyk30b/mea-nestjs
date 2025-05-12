import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class ReceiptPayment {
  @Expose()
  @IsDefined()
  @IsInt()
  receiptId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number
}
export class DistributorPaymentBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  distributorId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  cashierId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number

  @ApiProperty({
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
  receiptPaymentList: ReceiptPayment[]
}
