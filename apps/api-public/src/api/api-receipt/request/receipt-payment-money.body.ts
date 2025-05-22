import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNumber } from 'class-validator'

export class ReceiptPaymentMoneyBody {
  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  money: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number
}
